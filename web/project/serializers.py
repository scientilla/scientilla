
from marshmallow import fields
from project import ma
from project.models import Document


class DocumentSchema(ma.ModelSchema):
    class Meta:
        model = Document
        fields = ('id', 'title', 'year', 'type')

