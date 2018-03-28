# Publication Resources

    GET api/v1/users/username/:username/publications

## Description

Returns the list of all publications verified by a given user

***

## Authentication

No Authentication is necessary.

***

## Parameters

### URL parameters

- **username** - The username of the user

### Query string parameters

- **limit** - The maximum number of document returned. When `limit` is 0, all the publications will be returned
- **skip** - The number of documents skipped. Use to paginate the results

***

## Return format

A JSON object with the following format:

- **count** - Total number of publications for the user
- **items** - A list of documents, with the length specified in the pagination parameters

Each document has the following format:

- **authorships** - A list of the `authorships` of the document
- **affiliations** - A list of the `affiliations` of the document
- **institutes** - A list of the `institutes` relative to the `affiliations` of the document
- **documenttype** - An object representing the `document type`
- **source** - An object representing the `source` of the document, MUST be `null` if the document is an `invited talk`
- **draftCreator** - The user who originally inserted the document on Scientilla, MUST be `null`
- **draftGroupCreator** - The group who originally inserted the document on Scientilla, MUST be `null`
- **title** - The title of the document
- **authorsStr** - The authors of the document, represented with a string
- **authorKeywords** - The keywords used by the document authors in the original document, represented with a string
- **year** - The year of publication of the document, represented with a string
- **issue** - The issue of the document
- **volume** - The volume of the document
- **pages** - The pages of the document
- **articleNumber** - The article numberof the document
- **doi** - The [DOI](https://www.doi.org/) of the document
- **type** - The key of the `document type` of the document
- **sourceType** - The key of the `source` of the document
- **itSource** - The source of the document when its type is an `invited talk`
- **scopusId** - The [scopus](https://www.scopus.com) ID of the document
- **scopus_id_deleted** - *TODO*
- **wosId** - The [Web Of Science](https://clarivate.com/products/web-of-science/) ID of the document
- **iitPublicationsId** - The [Publications](http://publications.iit.it) ID of the document
- **abstract** - The abstract of the document
- **kind** - The kind of the document, must be 'v'
- **origin** - The origin of the document
- **synchronized** - The synchronization status the document, can be True, False or null
- **id** - The internal ID of the document
- **createdAt** - The creation timestamp of the document, in [ISO 8601 format](https://www.iso.org/standard/40874.html)
- **updatedAt** - The latest update timestamp of the document, in [ISO 8601 format](https://www.iso.org/standard/40874.html)
- **sourceDetails** - A user friendly description of the source details (source, issue, volume, pages, article number) of the document
- **duplicates** - *TODO*
- **inPress** - A boolean value describing whether the document is in press or not
- **authorDetails** - A list of `author details` of the document
- **sourceTypeObj** - The `source type` of the document

***

## Errors

All known errors cause the resource to return a JSON object containing at least the 'error' and 'item' keys describing the source of error.

Possible errors:

- **404** - There is no user with username `username`.

***

## Example

**Request**

    GET api/v1/users/username/roberto.cingolani@iit.it/publications?limit=1&skip=1
    
**Return** 
``` json
{
    "count": 949,
    "items": [
        {
            "authorships": [
                {
                    "researchEntity": null,
                    "document": 37740,
                    "corresponding": false,
                    "position": 2,
                    "public": null,
                    "id": 1350239,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 37740,
                    "corresponding": false,
                    "position": 3,
                    "public": null,
                    "id": 1350240,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 37740,
                    "corresponding": false,
                    "position": 6,
                    "public": null,
                    "id": 1350243,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 37740,
                    "corresponding": false,
                    "position": 7,
                    "public": null,
                    "id": 1350244,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 37740,
                    "corresponding": false,
                    "position": 8,
                    "public": null,
                    "id": 1350245,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 37740,
                    "corresponding": false,
                    "position": 9,
                    "public": null,
                    "id": 1350246,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-09-23T00:10:43.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": 4,
                    "document": 37740,
                    "corresponding": false,
                    "position": 5,
                    "public": true,
                    "id": 1350474,
                    "createdAt": "2017-07-27T09:56:02.000Z",
                    "updatedAt": "2017-07-27T09:56:02.000Z",
                    "synchronize": true,
                    "favorite": null,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false
                },
                {
                    "researchEntity": 292,
                    "document": 37740,
                    "corresponding": false,
                    "position": 4,
                    "public": true,
                    "id": 6082727,
                    "createdAt": "2017-08-18T09:09:11.000Z",
                    "updatedAt": "2017-08-18T09:09:11.000Z",
                    "synchronize": true,
                    "favorite": null,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false
                },
                {
                    "researchEntity": 142,
                    "document": 37740,
                    "corresponding": true,
                    "position": 10,
                    "public": true,
                    "id": 11408780,
                    "createdAt": "2017-10-12T06:22:45.000Z",
                    "updatedAt": "2017-10-12T06:22:45.000Z",
                    "synchronize": true,
                    "favorite": null,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false
                },
                {
                    "researchEntity": 1296,
                    "document": 37740,
                    "corresponding": false,
                    "position": 1,
                    "public": true,
                    "id": 11909880,
                    "createdAt": "2017-10-17T07:05:05.000Z",
                    "updatedAt": "2017-10-17T07:05:05.000Z",
                    "synchronize": true,
                    "favorite": null,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false
                },
                {
                    "researchEntity": 317,
                    "document": 37740,
                    "corresponding": true,
                    "position": 0,
                    "public": true,
                    "id": 14480198,
                    "createdAt": "2017-11-15T11:13:21.000Z",
                    "updatedAt": "2017-11-15T11:13:21.000Z",
                    "synchronize": true,
                    "favorite": null,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false
                }
            ],
            "affiliations": [
                {
                    "authorship": 1350245,
                    "document": 37740,
                    "institute": 507,
                    "id": 938867,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z"
                },
                {
                    "authorship": 1350239,
                    "document": 37740,
                    "institute": 729,
                    "id": 938870,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z"
                },
                {
                    "authorship": 1350240,
                    "document": 37740,
                    "institute": 1,
                    "id": 938871,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z"
                },
                {
                    "authorship": 1350243,
                    "document": 37740,
                    "institute": 1,
                    "id": 938874,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z"
                },
                {
                    "authorship": 1350244,
                    "document": 37740,
                    "institute": 507,
                    "id": 938875,
                    "createdAt": "2017-07-27T09:53:22.000Z",
                    "updatedAt": "2017-07-27T09:53:22.000Z"
                },
                {
                    "authorship": 1350474,
                    "document": 37740,
                    "institute": 1,
                    "id": 939014,
                    "createdAt": "2017-07-27T09:56:02.000Z",
                    "updatedAt": "2017-07-27T09:56:02.000Z"
                },
                {
                    "authorship": 6082727,
                    "document": 37740,
                    "institute": 1,
                    "id": 4839819,
                    "createdAt": "2017-08-18T09:09:11.000Z",
                    "updatedAt": "2017-08-18T09:09:11.000Z"
                },
                {
                    "authorship": 1350246,
                    "document": 37740,
                    "institute": 1935,
                    "id": 8584692,
                    "createdAt": "2017-09-23T00:10:43.000Z",
                    "updatedAt": "2017-09-23T00:10:43.000Z"
                },
                {
                    "authorship": 1350246,
                    "document": 37740,
                    "institute": 1935,
                    "id": 8584693,
                    "createdAt": "2017-09-23T00:10:43.000Z",
                    "updatedAt": "2017-09-23T00:10:43.000Z"
                },
                {
                    "authorship": 11408780,
                    "document": 37740,
                    "institute": 1,
                    "id": 11044752,
                    "createdAt": "2017-10-12T06:22:45.000Z",
                    "updatedAt": "2017-10-12T06:22:45.000Z"
                },
                {
                    "authorship": 11909880,
                    "document": 37740,
                    "institute": 1,
                    "id": 11632422,
                    "createdAt": "2017-10-17T07:05:05.000Z",
                    "updatedAt": "2017-10-17T07:05:05.000Z"
                },
                {
                    "authorship": 14480198,
                    "document": 37740,
                    "institute": 1,
                    "id": 14642110,
                    "createdAt": "2017-11-15T11:13:21.000Z",
                    "updatedAt": "2017-11-15T11:13:21.000Z"
                }
            ],
            "institutes": [
                {
                    "name": "Istituto Italiano di Tecnologia",
                    "country": "Italy",
                    "city": "Genoa",
                    "shortname": "IIT",
                    "scopusId": "60102151",
                    "parentId": null,
                    "id": 1,
                    "createdAt": "2017-02-10T21:41:44.000Z",
                    "updatedAt": "2017-02-10T21:41:44.000Z",
                    "group": null,
                    "aliasOf": null
                },
                {
                    "name": "Friedrich Schiller Universitat Jena",
                    "country": "Germany",
                    "city": "Jena",
                    "shortname": null,
                    "scopusId": "60029507",
                    "parentId": null,
                    "id": 507,
                    "createdAt": "2017-02-10T21:47:42.000Z",
                    "updatedAt": "2017-02-10T21:47:42.000Z",
                    "group": null,
                    "aliasOf": null
                },
                {
                    "name": "Universidad de Sevilla",
                    "country": "Spain",
                    "city": "Sevilla",
                    "shortname": null,
                    "scopusId": "60033284",
                    "parentId": null,
                    "id": 729,
                    "createdAt": "2017-02-10T21:49:34.000Z",
                    "updatedAt": "2017-02-10T21:49:34.000Z",
                    "group": null,
                    "aliasOf": null
                },
                {
                    "name": "Universidad de Malaga",
                    "country": "Spain",
                    "city": "Malaga",
                    "shortname": null,
                    "scopusId": "60003662",
                    "parentId": null,
                    "id": 1935,
                    "createdAt": "2017-02-10T22:00:50.000Z",
                    "updatedAt": "2017-02-10T22:00:50.000Z",
                    "group": null,
                    "aliasOf": null
                }
            ],
            "documenttype": {
                "defaultSourceType": null,
                "key": "article",
                "shortLabel": "AR",
                "label": "Article",
                "type": "publication",
                "highimpact": true,
                "id": 1,
                "createdAt": "2017-09-21T09:10:01.000Z",
                "updatedAt": "2017-11-24T08:33:06.000Z"
            },
            "source": {
                "title": "Carbohydrate Polymers",
                "issn": "01448617",
                "eissn": null,
                "acronym": null,
                "location": null,
                "year": null,
                "publisher": "Pergamon Press Ltd.",
                "isbn": null,
                "website": null,
                "type": "journal",
                "scopusId": "25801",
                "id": 5704,
                "createdAt": "2017-02-10T21:42:19.000Z",
                "updatedAt": "2017-02-10T21:42:19.000Z",
                "sourcetype": {
                    "key": "journal",
                    "label": "Journal",
                    "section": "",
                    "type": "publication",
                    "id": 2,
                    "createdAt": "2017-09-21T09:09:50.000Z",
                    "updatedAt": "2018-03-26T09:30:39.000Z"
                }
            },
            "draftCreator": null,
            "draftGroupCreator": null,
            "title": "Cellulose-polyhydroxylated fatty acid ester-based bioplastics with tuning properties: Acylation via a mixed anhydride system",
            "authorsStr": "Heredia-Guerrero J.A., Goldoni L., Benitez J.J., Davis A., Ceseracciu L., Cingolani R., Bayer I.S., Heinze T., Koschella A., Heredia A., Athanassiou A.",
            "authorKeywords": "Aleuritic acid, Bioplastics, Cellulose ester, Microcrystalline cellulose, Mixed anhydride system",
            "year": "2017",
            "issue": null,
            "volume": "173",
            "pages": "312-320",
            "articleNumber": null,
            "doi": "10.1016/j.carbpol.2017.05.068",
            "type": "article",
            "sourceType": "journal",
            "itSource": null,
            "scopusId": "85020251576",
            "scopus_id_deleted": false,
            "wosId": null,
            "iitPublicationsId": null,
            "abstract": "© 2017 Elsevier Ltd The synthesis of microcrystalline cellulose (MCC) and 9,10,16-hydroxyhexadecanoic (aleuritic) acid ester-based bioplastics was investigated through acylation in a mixed anhydride (trifluoroacetic acid (TFA)/trifluoroacetic acid anhydride (TFAA)), chloroform co-solvent system. The effects of chemical interactions and the molar ratio of aleuritic acid to the anhydroglucose unit (AGU) of cellulose were investigated. The degree of substitution (DS) of new polymers were characterized by two-dimensional solution-state NMR and ranged from 0.51 to 2.60. The chemical analysis by attenuated total reflection-Fourier transform infrared spectroscopy (ATR-FTIR) confirmed the presence of aleuritate groups in the structure induces the formation of new H-bond networks. The tensile analysis and the contact angle measurement confirmed the ductile behavior and the hydrophobicity of the prepared bioplastics. By increasing the aleuritate amounts, the glass transition temperature decreased and the solubility of bioplastic films in most common solvents was improved. Furthermore, this new polymer exhibits similar properties compared to commercial cellulose derivatives.",
            "kind": "v",
            "origin": "scopus",
            "synchronized": true,
            "id": 37740,
            "createdAt": "2017-07-27T09:53:22.000Z",
            "updatedAt": "2018-02-09T02:29:51.000Z",
            "sourceDetails": "Carbohydrate Polymers, vol. 173, pp. 312-320",
            "duplicates": [],
            "inPress": false,
            "authorDetails": [
                {
                    "author": "Heredia-Guerrero J.A.",
                    "corresponding": true,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": 317
                },
                {
                    "author": "Goldoni L.",
                    "corresponding": false,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": 1296
                },
                {
                    "author": "Benitez J.J.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universidad de Sevilla"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Davis A.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": null
                },
                {
                    "author": "Ceseracciu L.",
                    "corresponding": false,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": 292
                },
                {
                    "author": "Cingolani R.",
                    "corresponding": false,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": 4
                },
                {
                    "author": "Bayer I.S.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": null
                },
                {
                    "author": "Heinze T.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Friedrich Schiller Universitat Jena"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Koschella A.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Friedrich Schiller Universitat Jena"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Heredia A.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universidad de Malaga"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Athanassiou A.",
                    "corresponding": true,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": 142
                }
            ],
            "sourceTypeObj": {
                "key": "journal",
                "label": "Journal",
                "section": "",
                "type": "publication",
                "id": 2,
                "createdAt": "2017-09-21T09:09:50.000Z",
                "updatedAt": "2018-03-26T09:30:39.000Z"
            }
        }
    ]
}
```

[API docs](/docs/README.md)
