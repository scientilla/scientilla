


const initialize = require('./init.js');

initialize();

/*
(async () => {
    const doc = await Document.findOne({
        where: {
            id: 7883
        }
    });

    console.log(doc.authors);
    const authors = await doc.getAuthors();
    console.log(authors.length);
    console.log(doc.authors);
})();*/

//models.user.resource.findAll().then(users => console.log(users));