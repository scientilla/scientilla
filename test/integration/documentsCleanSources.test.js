/* global SourceMetric, Document, Source, SourceMetricSource, Cleaner*/
"use strict";

const test = require('./../helper.js');
const should = require('should');
const _ = require('lodash');


describe('Documents clean sources', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    const documentsData = test.getAllDocumentData();
    const sourcesData = test.getAllSourceData();
    const metricsData = test.getAllMetricData();

    it("should merge same sources", async function () {

        await Promise.all(sourcesData.map(s => Source.create(s)));

        await Cleaner.cleanSourceCopies();

        const cleanedSources = await Source.find();

        const test1Sources = cleanedSources.filter(s => s.title === 'Test1');
        const test2Sources = cleanedSources.filter(s => s.title === 'Test2');

        test1Sources.length.should.equal(2);
        test2Sources.length.should.equal(1);

        const conferenceSource = test1Sources.find(s => s.type === 'conference');
        const bookSource = test1Sources.find(s => s.type === 'book');

        conferenceSource.should.not.equal(undefined);
        conferenceSource.issn.should.equal('33331234');
        conferenceSource.acronym.should.equal('t1');

        bookSource.should.not.equal(undefined);
        bookSource.eissn.should.equal('11111234');

        test2Sources[0].acronym.should.equal('t2');
    });

    it("should update documents and metrics", async function () {
        await Source.destroy();

        const sData = sourcesData.slice(3, 8);
        await Promise.all(sData.map(s => Source.create(s)));
        const [
            sourceToMerge,
            sourceUnmodified1,
            sourceToMergeAndDelete,
            sourceUnmodified2,
            sourceUnmodified3
        ] = await Source.find();

        await Promise.all(metricsData.map(m => SourceMetric.create(m)));
        await SourceMetric.assignMetrics();

        const docsData = await test.fixDocumentsDocumenttype(documentsData.slice(0, 5));
        docsData[0].source = sourceToMerge;
        docsData[1].source = sourceUnmodified1;
        docsData[2].source = sourceToMergeAndDelete;
        docsData[3].source = sourceUnmodified2;
        docsData[4].source = sourceUnmodified3;
        const documents = await Promise.all(docsData.map(m => Document.create(m)));
        const sourceMetricsSources = await SourceMetricSource.find();

        await Cleaner.cleanSourceCopies();

        const cleanedSources = await Source.find();
        const cleanedDocments = await Document.find();
        const cleanedSourceMetricSources = await SourceMetricSource.find();

        cleanedDocments.length.should.equal(5);
        const mergedSourceDocuments = cleanedDocments.filter(d => d.source === sourceToMerge.id && [documents[0].id, documents[2].id].includes(d.id));
        mergedSourceDocuments.length.should.equal(2);

        const mergedAndDeletedSourceDocuments = cleanedDocments.filter(d => d.source === sourceToMergeAndDelete.id);
        mergedAndDeletedSourceDocuments.length.should.equal(0);

        should.exist(cleanedDocments.find(d => d.source === sourceUnmodified3.id));

        cleanedSources.length.should.equal(4);
        cleanedSources.filter(s => s.id !== sourceToMergeAndDelete.id).length.should.equal(4);


        const sourceToMergeMetrics = sourceMetricsSources.filter(sms => sms.source === sourceToMerge.id);
        const sourceUnmodified1Metrics = sourceMetricsSources.filter(sms => sms.source === sourceUnmodified1.id);
        const sourceToMergeAndDeleteMetrics = sourceMetricsSources.filter(sms => sms.source === sourceToMergeAndDelete.id);

        const shouldSourceToMergeMetrics = _.uniqWith(sourceToMergeMetrics.concat(sourceToMergeAndDeleteMetrics),
            (sms, newSms) => sms.source === newSms.source && sms.sourceMetric === newSms.sourceMetric);

        const cleanedSourceToMergeMetrics = cleanedSourceMetricSources.filter(sms => sms.source === sourceToMerge.id);
        const cleanedSourceUnmodified1Metrics = cleanedSourceMetricSources.filter(sms => sms.source === sourceUnmodified1.id);
        const cleanedSourceToMergeAndDeleteMetrics = cleanedSourceMetricSources.filter(sms => sms.source === sourceToMergeAndDelete.id);

        cleanedSourceToMergeMetrics.length.should.equal(shouldSourceToMergeMetrics.length);
        cleanedSourceUnmodified1Metrics.length.should.equal(sourceUnmodified1Metrics.length);
        cleanedSourceToMergeAndDeleteMetrics.length.should.equal(0);
    });

});