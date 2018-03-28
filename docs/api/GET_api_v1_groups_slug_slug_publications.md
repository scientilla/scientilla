# Publication Resources

    GET api/v1/groups/slug/:slug/publications

## Description

Returns the list of all publications verified by a given group

***

## Authentication

No Authentication is necessary.

***

## Parameters

### URL parameters

- **slug** - The slug of the group

### Query string parameters

- **limit** - The maximum number of document returned. When `limit` is 0, all the publications will be returned
- **skip** - The number of documents skipped. Use to paginate the results

***

## Return format

A JSON object with the following format:

- **count** - Total number of publications for the group
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

- **404** - There is no group with slug `slug`.

***

## Example

**Request**

    GET api/v1/groups/slug/istituto-italiano-di-tecnologia/publications
**Return** 
``` json
{
    "count": 11072,
    "items": [
        {
            "authorships": [
                {
                    "researchEntity": null,
                    "document": 41623,
                    "corresponding": true,
                    "position": 0,
                    "public": null,
                    "id": 8792130,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 41623,
                    "corresponding": true,
                    "position": 1,
                    "public": null,
                    "id": 8792131,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 41623,
                    "corresponding": true,
                    "position": 2,
                    "public": null,
                    "id": 8792132,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 41623,
                    "corresponding": true,
                    "position": 4,
                    "public": null,
                    "id": 8792134,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 41623,
                    "corresponding": true,
                    "position": 5,
                    "public": null,
                    "id": 8792135,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": 124,
                    "document": 41623,
                    "corresponding": true,
                    "position": 3,
                    "public": true,
                    "id": 16436155,
                    "createdAt": "2017-11-30T19:38:43.000Z",
                    "updatedAt": "2017-11-30T19:38:43.000Z",
                    "synchronize": true,
                    "favorite": null,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false
                }
            ],
            "affiliations": [
                {
                    "authorship": 8792132,
                    "document": 41623,
                    "institute": 434,
                    "id": 7996128,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z"
                },
                {
                    "authorship": 8792134,
                    "document": 41623,
                    "institute": 434,
                    "id": 7996130,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z"
                },
                {
                    "authorship": 8792135,
                    "document": 41623,
                    "institute": 1,
                    "id": 7996131,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z"
                },
                {
                    "authorship": 8792130,
                    "document": 41623,
                    "institute": 1,
                    "id": 7996132,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z"
                },
                {
                    "authorship": 8792131,
                    "document": 41623,
                    "institute": 434,
                    "id": 7996133,
                    "createdAt": "2017-09-14T14:40:31.000Z",
                    "updatedAt": "2017-09-14T14:40:31.000Z"
                },
                {
                    "authorship": 16436155,
                    "document": 41623,
                    "institute": 1,
                    "id": 16937557,
                    "createdAt": "2017-11-30T19:38:43.000Z",
                    "updatedAt": "2017-11-30T19:38:43.000Z"
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
                    "name": "Politecnico di Torino",
                    "country": "Italy",
                    "city": "Torino",
                    "shortname": null,
                    "scopusId": "60012162",
                    "parentId": null,
                    "id": 434,
                    "createdAt": "2017-02-10T21:47:18.000Z",
                    "updatedAt": "2017-02-10T21:47:18.000Z",
                    "group": null,
                    "aliasOf": null
                }
            ],
            "documenttype": {
                "defaultSourceType": null,
                "key": "conference_paper",
                "shortLabel": "CP",
                "label": "Conference Paper",
                "type": "publication",
                "highimpact": true,
                "id": 6,
                "createdAt": "2017-09-21T09:10:01.000Z",
                "updatedAt": "2017-11-24T08:30:28.000Z"
            },
            "source": {
                "title": "Mechanisms and Machine Science",
                "issn": "22110984",
                "eissn": "22110992",
                "acronym": "RAAD 2017",
                "location": "Turin",
                "year": "2018",
                "publisher": "Springer Netherlands",
                "isbn": "9783319612751",
                "website": "http://www.springer.com/series/8779",
                "type": "bookseries",
                "scopusId": "21100298603",
                "id": 62610,
                "createdAt": "2017-10-12T23:11:20.000Z",
                "updatedAt": "2017-10-12T23:11:20.000Z",
                "sourcetype": {
                    "key": "bookseries",
                    "label": "Book Series",
                    "section": "",
                    "type": "publication",
                    "id": 4,
                    "createdAt": "2017-09-21T09:09:50.000Z",
                    "updatedAt": "2018-03-22T16:40:33.000Z"
                }
            },
            "draftCreator": null,
            "draftGroupCreator": null,
            "title": "Advanced modelling techniques for flexible robotic systems",
            "authorsStr": "D'Imperio M., Pizzamiglio C., Ludovico D., Caldwell D.G., Genta G., Cannella F.",
            "authorKeywords": "Flexible robotic leg, Jumping robot, Multi-body analysis",
            "year": "2018",
            "issue": null,
            "volume": "49",
            "pages": "381-388",
            "articleNumber": null,
            "doi": "10.1007/978-3-319-61276-8_42",
            "type": "conference_paper",
            "sourceType": "bookseries",
            "itSource": null,
            "scopusId": "85028362411",
            "scopus_id_deleted": false,
            "wosId": null,
            "iitPublicationsId": null,
            "abstract": "© 2018, Springer International Publishing AG. The purpose of this paper is to present a 3 DoF underactuated mechanism with one flexible component. It is called FLEGX (FLEXible LEG) and it would be the first step in the design of a jumping humanoid robot with flexible limbs. An early system-level design validation of the FLEGX mechanical configuration was performed using the software MSC.Nastran ® and MSC.Adams ® -Matlab/Simulink ® integrated environment.",
            "kind": "v",
            "origin": "scopus",
            "synchronized": true,
            "id": 41623,
            "createdAt": "2017-09-14T14:40:30.000Z",
            "updatedAt": "2018-02-09T02:30:03.000Z",
            "sourceDetails": "Mechanisms and Machine Science, vol. 49, pp. 381-388",
            "duplicates": [],
            "inPress": false,
            "authorDetails": [
                {
                    "author": "D'Imperio M.",
                    "corresponding": true,
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
                    "author": "Pizzamiglio C.",
                    "corresponding": true,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Politecnico di Torino"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Ludovico D.",
                    "corresponding": true,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Politecnico di Torino"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Caldwell D.G.",
                    "corresponding": true,
                    "first_coauthor": false,
                    "last_coauthor": false,
                    "oral_presentation": false,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": 124
                },
                {
                    "author": "Genta G.",
                    "corresponding": true,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Politecnico di Torino"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Cannella F.",
                    "corresponding": true,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": null
                }
            ],
            "sourceTypeObj": {
                "key": "bookseries",
                "label": "Book Series",
                "section": "",
                "type": "publication",
                "id": 4,
                "createdAt": "2017-09-21T09:09:50.000Z",
                "updatedAt": "2018-03-22T16:40:33.000Z"
            }
        },
        
        ...
        
        {
            "authorships": [
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 7,
                    "public": null,
                    "id": 32116067,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 6,
                    "public": null,
                    "id": 32116068,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 5,
                    "public": null,
                    "id": 32116069,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 4,
                    "public": null,
                    "id": 32116070,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 3,
                    "public": null,
                    "id": 32116071,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 2,
                    "public": null,
                    "id": 32116072,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": false,
                    "position": 1,
                    "public": null,
                    "id": 32116073,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                },
                {
                    "researchEntity": null,
                    "document": 67321,
                    "corresponding": true,
                    "position": 0,
                    "public": null,
                    "id": 32116074,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z",
                    "synchronize": null,
                    "favorite": null,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null
                }
            ],
            "affiliations": [
                {
                    "authorship": 32116067,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443086,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116067,
                    "document": 67321,
                    "institute": 3367,
                    "id": 35443087,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116068,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443088,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116068,
                    "document": 67321,
                    "institute": 3367,
                    "id": 35443089,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116069,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443090,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116069,
                    "document": 67321,
                    "institute": 3367,
                    "id": 35443091,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116070,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443092,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116071,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443093,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116072,
                    "document": 67321,
                    "institute": 1,
                    "id": 35443094,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116072,
                    "document": 67321,
                    "institute": 116,
                    "id": 35443095,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116073,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443096,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116074,
                    "document": 67321,
                    "institute": 2,
                    "id": 35443097,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
                },
                {
                    "authorship": 32116074,
                    "document": 67321,
                    "institute": 3367,
                    "id": 35443098,
                    "createdAt": "2018-03-20T13:46:57.000Z",
                    "updatedAt": "2018-03-20T13:46:57.000Z"
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
                    "name": "Universita degli Studi di Genova",
                    "country": "Italy",
                    "city": "Genoa",
                    "shortname": null,
                    "scopusId": "60025153",
                    "parentId": null,
                    "id": 2,
                    "createdAt": "2017-02-10T21:44:48.000Z",
                    "updatedAt": "2017-02-10T21:44:48.000Z",
                    "group": null,
                    "aliasOf": null
                },
                {
                    "name": "Inserm",
                    "country": "France",
                    "city": "Paris",
                    "shortname": null,
                    "scopusId": "60000905",
                    "parentId": null,
                    "id": 116,
                    "createdAt": "2017-02-10T21:45:42.000Z",
                    "updatedAt": "2017-02-10T21:45:42.000Z",
                    "group": null,
                    "aliasOf": null
                },
                {
                    "name": "Ospedale Policlinico",
                    "country": "Italy",
                    "city": "Verona",
                    "shortname": null,
                    "scopusId": "60060733",
                    "parentId": null,
                    "id": 3367,
                    "createdAt": "2017-05-29T17:35:24.000Z",
                    "updatedAt": "2017-05-29T17:35:24.000Z",
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
                "title": "Frontiers in Neurology",
                "issn": "16642295",
                "eissn": null,
                "acronym": null,
                "location": null,
                "year": null,
                "publisher": "Frontiers Media S.A.",
                "isbn": null,
                "website": null,
                "type": "journal",
                "scopusId": "21100212316",
                "id": 11425,
                "createdAt": "2017-02-10T21:42:19.000Z",
                "updatedAt": "2018-03-20T16:05:46.000Z",
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
            "title": "Postural stabilization strategies to motor contagion induced by action observation are impaired in Parkinson's disease",
            "authorsStr": "Pelosin E., Bisio A., Pozzo T., Lagravinese G., Crisafulli O., Marchese R., Abbruzzese G., Avanzino L.",
            "authorKeywords": "Action observation, Biological motion, Chameleon effect, Motor contagion, Parkinson's disease, Postural stabilization strategies",
            "year": "2018",
            "issue": "MAR",
            "volume": "9",
            "pages": null,
            "articleNumber": "105",
            "doi": "10.3389/fneur.2018.00105",
            "type": "article",
            "sourceType": "journal",
            "itSource": null,
            "scopusId": "85042746235",
            "scopus_id_deleted": false,
            "wosId": null,
            "iitPublicationsId": null,
            "abstract": "© 2018 Pelosin, Bisio, Pozzo, Lagravinese, Crisafulli, Marchese, Abbruzzese and Avanzino. Postural reactions can be influenced by concomitant tasks or different contexts and are modulated by a higher order motor control. Recent studies investigated postural changes determined by motor contagion induced by action observation (chameleon effect) showing that observing a model in postural disequilibrium induces an increase in healthy subjects' body sway. Parkinson's disease (PD) is associated with postural instability and impairments in cognitively controlled balance tasks. However, no studies investigated if viewing postural imbalance might influence postural stability in PD and if patients are able to inhibit a visual postural perturbation. In this study, an action observation paradigm for assessing postural reaction to motor contagion in PD subjects and healthy older adults was used. Postural stability changes were measured during the observation of a static stimulus (control condition) and during a point-light display of a gymnast balancing on a rope (biological stimulus). Our results showed that, during the observation of the biological stimulus, sway area and antero-posterior and medio-lateral displacements of center of pressure significantly increased only in PD participants, whereas correct stabilization reactions were present in elderly subjects. These results demonstrate that PD leads to a decreased capacity to control automatic imitative tendencies induced by motor contagion. This behavior could be the consequence either of an inability to inhibit automatic imitative tendencies or of the cognitive load requested by the task. Whatever the case, the issue about the ability to inhibit automatic imitative tendencies could be crucial for PD patients since it might increase falls risk and injuries.",
            "kind": "v",
            "origin": "scopus",
            "synchronized": true,
            "id": 67321,
            "createdAt": "2018-03-20T13:46:57.000Z",
            "updatedAt": "2018-03-20T13:46:57.000Z",
            "sourceDetails": "Frontiers in Neurology, vol. 9, (no. MAR)",
            "duplicates": [],
            "inPress": false,
            "authorDetails": [
                {
                    "author": "Pelosin E.",
                    "corresponding": true,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova",
                        "Ospedale Policlinico"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Bisio A.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Pozzo T.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Istituto Italiano di Tecnologia",
                        "Inserm"
                    ],
                    "mainGroupAffiliation": true,
                    "userId": null
                },
                {
                    "author": "Lagravinese G.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Crisafulli O.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Marchese R.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova",
                        "Ospedale Policlinico"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Abbruzzese G.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova",
                        "Ospedale Policlinico"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
                },
                {
                    "author": "Avanzino L.",
                    "corresponding": false,
                    "first_coauthor": null,
                    "last_coauthor": null,
                    "oral_presentation": null,
                    "affiliations": [
                        "Universita degli Studi di Genova",
                        "Ospedale Policlinico"
                    ],
                    "mainGroupAffiliation": false,
                    "userId": null
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
