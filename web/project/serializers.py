
from marshmallow import fields
from project.models import Document, Authorship
from flask_marshmallow import Marshmallow

ma = Marshmallow()

class AuthorshipSchema(ma.ModelSchema):
    class Meta:
        model = Authorship


class DocumentSchema(ma.ModelSchema):
    authorships = fields.Nested(AuthorshipSchema, many=True)
    excludable_fields = ['source', 'affiliations', 'authorships', 'groupAuthorships']
    attributes = ['title', 'authorsStr', 'year']
    
    def __init__(self, additional_fields = [], **kwargs):
        # exclude = [f for f in self.excludable_fields if f not in additional_fields]
        # kwargs['exclude'] = exclude
        only = self.attributes + additional_fields
        kwargs['only'] = only
        super().__init__(**kwargs)

    class Meta:
        model = Document