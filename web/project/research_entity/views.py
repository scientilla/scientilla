import json
from sqlalchemy.dialects import postgresql
from flask import Blueprint, abort, jsonify, request

from project import db, app

from project.models import User, Group, Document
from project.serializers import DocumentSchema

prefix = '/api/v1/'

research_entity_blueprint = Blueprint('research_entity_blueprint', __name__)

@research_entity_blueprint.route(prefix + '<any("groups", "users"):route_path>/<int:research_entity_id>/drafts/<int:draft_id>/verified', methods=["PUT"])
def verify_draft(route_path, research_entity_id, draft_id):
    verification_data = request.get_json()
    ResearchEntityModel = get_research_entity_model(route_path)
    research_entity = ResearchEntityModel.query.filter_by(id = research_entity_id).first_or_404()
    draft = Document.query.filter_by(id = draft_id).first_or_404()
    res = research_entity.verify_draft(draft, verification_data)
    if type(res) is dict:
        return jsonify(res)        
    document_schema = DocumentSchema()
    return document_schema.jsonify(res)

@research_entity_blueprint.route(prefix + '<any("groups", "users"):route_path>/<int:research_entity_id>/documents', methods=["GET"])
def get_documents(route_path, research_entity_id):
    populate_fields = request.args.getlist('populate')
    where = request.args.get('where')
    conditions = json.loads(where)
    filters = conditions_to_filter(conditions)
    offset = request.args.get('skip', default=0, type=int)
    limit = request.args.get('limit', default=200, type=int)
    assert limit>0
    assert offset>=0
    print(limit)
    # ResearchEntityModel = get_research_entity_model(route_path)
    # assert ResearchEntityModel
    # research_entity = ResearchEntityModel.query.filter_by(id=research_entity_id).first_or_404()
    # documents = research_entity.documents #.order_by('id') #.limit(limit).offset(offset)
    documents = Document.query.filter(Document.groups.any(id=research_entity_id)).limit(limit).offset(offset)
    print(str(documents.statement.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True})))
    document_schema = DocumentSchema(additional_fields=populate_fields, many=True)
    return document_schema.jsonify(documents)

def get_research_entity_model(route_path):
    assert route_path in ['users', 'groups']
    if route_path == 'users':
        return User
    else:
        return Group

def conditions_to_filter(conditions):
    return [get_filter(attr, cond) for attr, cond in conditions.items() if 'contains' in cond.keys()]

def get_filter(attr, cond):
    if [*cond.keys()][0] == 'contains':
        return getattr(Document, attr).ilike('%%%s%%' %[*cond.values()][0])
    else:
        assert False