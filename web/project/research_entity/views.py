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

def get_research_entity_model(route_path):
    assert route_path in ['users', 'groups']
    if route_path == 'users':
        return User
    else:
        return Group