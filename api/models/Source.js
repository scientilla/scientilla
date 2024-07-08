/* global Source, SourceMetricSource,SourceTypes */
"use strict";

const fields = [
    'title',
    'issn',
    'eissn',
    'acronym',
    'location',
    'year',
    'publisher',
    'isbn',
    'website',
    'type',
    'scopusId'
];

module.exports = {
    attributes: {
        title: {
            type: 'string',
            required: true
        },
        issn: 'string',
        eissn: 'string',
        acronym: 'string',
        location: 'string',
        year: 'int',
        publisher: 'string',
        isbn: 'string',
        website: 'string',
        type: 'string',
        scopusId: 'string',
        sourcetype: {
            model: 'SourceType'
        },
        documents: {
            collection: 'document',
            via: 'source'
        },
        metrics: {
            collection: 'SourceMetric',
            via: 'sources',
            through: 'sourcemetricsource'
        },
        getSourceTypeObj: function () {
            if (!this.sourcetype)
                return undefined;

            return SourceTypes.get().find(st => st.id === this.sourcetype);
        },
        toJSON: function () {
            const source = this.toObject();
            source.sourcetype = this.getSourceTypeObj();
            return source;
        }

    },
    searchCopies: function (source, sources, index) {
        return sources.slice(index + 1).filter(s =>
            source.title === s.title &&
            ((isFieldEmpty(source.scopusId) || isFieldEmpty(s.scopusId)) || source.scopusId === s.scopusId) &&
            ((isFieldEmpty(source.issn) || isFieldEmpty(s.issn)) || source.issn === s.issn)
        );
    },
    merge: async function (source, copies) {
        let mergedFields = source;
        const sourcesToRemove = [];
        const conflicts = [];

        sails.log.info(`Merging ${source.id} - ${source.title} with ${copies.map(c => c.id).join(', ')} --------`);
        for (const copy of copies) {
            const newMergedFields = mergeFields(mergedFields, copy);
            if (!newMergedFields) {
                conflicts.push(copy.id);
                continue;
            }
            sourcesToRemove.push(copy);
            mergedFields = newMergedFields;
        }
        if (conflicts.length > 0)
            sails.log.info(`${conflicts.join(', ')} will not be merged because some fields are in confict`);

        if (_.isEqual(mergedFields, source))
            return false;

        await Source.update({id: source.id}, mergedFields);


        sails.log.info(`Deleting merged sources: ${sourcesToRemove.map(str => str.id).join(', ')}`);
        for (const sourceToRemove of sourcesToRemove) {
            const updatedDocuments = await Document.update({source: sourceToRemove.id}, {source: source.id});
            sails.log.info(`${updatedDocuments.length} documents updated from source ${sourceToRemove.id} to ${source.id}`);

            const updatedEditorship = await ResearchItemEditorship.update({source: sourceToRemove.id}, {source: source.id});
            sails.log.info(`${updatedEditorship.length} editorship updated from source ${sourceToRemove.id} to ${source.id}`);

            const sourcemetrisources = await SourceMetricSource.find({source: sourceToRemove.id});
            if (sourcemetrisources.length) {
                const sourcemetrisourcesIds = sourcemetrisources.map(d => d.id);
                await SourceMetricSource.destroy({id: sourcemetrisourcesIds});
                for (const sms of sourcemetrisources) {
                    await SourceMetricSource.findOrCreate({
                        sourceMetric: sms.sourceMetric,
                        source: source.id
                    });
                }
            }

            await sourceToRemove.destroy();
        }

        return sourcesToRemove;

    },
    beforeCreate: async (sourceData, cb) => {
        if (Array.isArray(sourceData)) {
            sails.log.error(`Source.beforeCreate called with an array with length ${sourceData.length}`);
        }
        if (!sourceData.type)
            return;
        const sourceType = SourceTypes.get().find(st => st.key === sourceData.type);
        if (sourceType)
            sourceData.sourcetype = sourceType.id;
        cb();
    }
};


function isFieldEmpty(field) {
    return _.isNil(field) || field === '';
}

function mergeFields(src, cp) {
    const merged = {};
    for (const f of fields) {
        const sourceField = _.isString(src[f]) ? src[f].toLocaleLowerCase() : src[f];
        const copyField = _.isString(cp[f]) ? cp[f].toLocaleLowerCase() : cp[f];

        if (!isFieldEmpty(sourceField) && !isFieldEmpty(copyField) && sourceField !== copyField)
            return false;

        merged[f] = (!isFieldEmpty(sourceField) && isFieldEmpty(copyField)) ? src[f] : cp[f];
    }

    return merged;
}
