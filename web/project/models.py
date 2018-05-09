# coding: utf-8
import enum
import re
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, JSON, Table, Text, text
from sqlalchemy.ext.declarative import declarative_base

from flask_sqlalchemy import SQLAlchemy
from project.exceptions import UnverifiableDocumentException

db = SQLAlchemy()

Base = declarative_base()
metadata = Base.metadata



class ResearchEntity(db.Model):
    __abstract__ = True

    def get_documents(self):
        return [a.document for a in self.authorships]

    def verify_draft(self, draft, verification_data):
        assert draft
        assert draft.kind == DocumentKinds.DRAFT.value
        with db.session.no_autoflush:
            try:            
                error = draft.get_draft_verification_errors(self)
                if error:
                    return error
                authorship = self.get_updated_authorship(draft, verification_data)
                assert authorship
                document_copies = draft.find_copies()
                n = len(document_copies)
                if n == 0:
                    doc_to_verify = draft.draft_to_document()
                else:
                    if n > 1:
                        print('Too many similar documents to %d (%d)', (draft.id, n))
                    doc_to_verify = document_copies[0]

                    doc_to_verify.add_missing_affiliation(draft)
                    print('Draft %d will be deleted and substituted by %d' % (draft.id, doc_to_verify.id))
                    db.session.delete(draft)
                     
                db.session.add(doc_to_verify)
                db.session.add(authorship)

                self.after_verify(doc_to_verify, authorship)

                db.session.commit()
                return doc_to_verify

            except UnverifiableDocumentException as err:
                return {
                    'isVerifiable': False,
                    'error': err.msg,
                    'document': err.document
                }

class Accesslog(db.Model):
    __tablename__ = 'accesslog'

    path = Column(Text)
    method = Column(Text)
    status = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('accesslog_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Affiliation(db.Model):
    __tablename__ = 'affiliation'

    authorship_id = Column('authorship', Integer, db.ForeignKey('authorship.id'))    
    authorship = db.relationship("Authorship", back_populates="affiliations")
    document_id = Column('document', Integer, db.ForeignKey('document.id'))    
    document = db.relationship("Document", back_populates="affiliations")
    institute_id = Column('institute', Integer, db.ForeignKey('institute.id'))    
    institute = db.relationship("Institute", back_populates="affiliations")
    id = Column(Integer, primary_key=True, server_default=text("nextval('affiliation_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    def __init__(self, authorship, document, institute):
        self.authorship = authorship
        self.document = document
        self.institute = institute


class Alias(db.Model):
    __tablename__ = 'alias'

    alias_str = Column('str', Text)
    user_id = Column('user', Integer, db.ForeignKey('user.id'))    
    user = db.relationship("User", back_populates="aliases")
    id = Column(Integer, primary_key=True, server_default=text("nextval('alias_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    def __init__(self, user, alias_str):
        self.user = user
        self.alias_str = alias_str


class Attempt(db.Model):
    __tablename__ = 'attempt'

    user = Column(Integer)
    successful = Column(Boolean)
    ip = Column(Text)
    port = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('attempt_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Attribute(db.Model):
    __tablename__ = 'attribute'

    category = Column(Text)
    key = Column(Text)
    value = Column(JSON)
    id = Column(Integer, primary_key=True, server_default=text("nextval('attribute_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Auth(db.Model):
    __tablename__ = 'auth'

    user = Column(Integer)
    username = Column(Text, unique=True)
    password = Column(Text)
    dn = Column(Text, unique=True)
    entryUUID = Column(Text, unique=True)
    name = Column(Text)
    surname = Column(Text)
    resetToken = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('auth_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class AuthorshipResearchEntity(db.Model):
    __abstract__ = True

    def load_fields_from_dict(self, fields_dict):
        fields = ['corresponding', 'synchronize', 'public', 'first_coauthor', 'last_coauthor', 'oral_presentation']
        for f in fields:
            if f in fields_dict:
                setattr(self, f, fields_dict[f])


class Authorship(AuthorshipResearchEntity):
    __tablename__ = 'authorship'

    research_entity_id = Column('researchEntity', Integer, db.ForeignKey('user.id'))    
    research_entity = db.relationship("User", back_populates="authorships")
    document_id = Column('document', Integer, db.ForeignKey('document.id'))    
    document = db.relationship("Document", back_populates="authorships")
    affiliations = db.relationship("Affiliation", back_populates="authorship")
    position = Column(Integer)
    public = Column(Boolean)
    favorite = Column(Boolean)
    synchronize = Column(Boolean)
    corresponding = Column(Boolean)
    first_coauthor = Column(Boolean)
    last_coauthor = Column(Boolean)
    oral_presentation = Column(Boolean)
    id = Column(Integer, primary_key=True, server_default=text("nextval('authorship_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    @staticmethod
    def get_fields():
        return [
            'researchEntity',
            'document',
            'affiliations',
            'position',
            'synchronize',
            'corresponding',
            'public',
            'favorite',
            'first_coauthor',
            'last_coauthor',
            'oral_presentation'
        ]

    @classmethod
    def filter_fields(cls, authorship_data):
        if type(authorship_data) is not dict:
            return {}
        new_authorship = {authorship_data[f] for f in cls.get_fields()}        
        return new_authorship

    @staticmethod
    def equals(aus1, aus2, not_checked_position):
        for a1 in aus1:
            a2 = next((a for a in aus if a.position == a1.position), None)
            if not a2:
                continue
            if a1.position == not_checked_position:
                continue
            if not a1.research_entity:
                continue
            if not a2.research_entity:
                continue
            a1_institutes = a1.get_affiliation_institutes()
            a2_institutes = a2.get_affiliation_institutes()
            if all(a in a2_institutes for a in a1_institutes):
                continue
            if all(a in a1_institutes for a in a2_institutes):
                continue
            return False
            
        return True

    def __init__(self, document, position, research_entity = None):
        self.research_entity = research_entity
        self.document = document
        self.position = position
        self.affiliations = []
        self.synchronize = None
        self.first_coauthor = False
        self.last_coauthor = False
        self.oral_presentation = False
        self.public = None
        self.favorite = None

    def set_affiliations(self, institute_ids):        
        document_institute_ids = [a.institute_id for a in self.affiliations]
        for institute_id in institute_ids:
            if institute_id not in document_institute_ids:
                institute = Institute.query.filter_by(id = institute_id).first()
                new_affiliation = Affiliation(self, self.document, institute)
                self.affiliations.append(new_affiliation)
        for affiliation in self.affiliations:
            if affiliation.institute_id is not None and affiliation.institute_id not in institute_ids:
                db.session.delete(affiliation)

    def get_affiliation_institutes(self):
        return [a.institute for a in self.affiliations]

class AuthorshipGroup(AuthorshipResearchEntity):
    __tablename__ = 'authorshipgroup'

    research_entity_id = Column('researchEntity', Integer, db.ForeignKey('group.id'))    
    research_entity = db.relationship("Group", back_populates="authorships")
    document_id = Column('document', Integer, db.ForeignKey('document.id'))    
    document = db.relationship("Document", back_populates="groupAuthorships")
    public = Column(Boolean)
    favorite = Column(Boolean)
    synchronize = Column(Boolean)
    id = Column(Integer, primary_key=True, server_default=text("nextval('authorshipgroup_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    def __init__(self, document, research_entity):
        self.research_entity = research_entity
        self.document = document
        self.synchronize = None
        self.first_coauthor = False
        self.last_coauthor = False
        self.oral_presentation = False
        self.public = None
        self.favorite = None


class Chartdatum(db.Model):
    __tablename__ = 'chartdata'

    key = Column(Text)
    value = Column(JSON)
    researchEntityType = Column(Text)
    researchEntity = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('chartdata_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Citation(db.Model):
    __tablename__ = 'citation'

    origin = Column(Text)
    originId = Column(Text)
    year = Column(Integer)
    citations = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('citation_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Collaboration(db.Model):
    __tablename__ = 'collaboration'

    user = Column(Integer)
    group = Column(Integer)
    fromMonth = Column(Integer)
    fromYear = Column(Integer)
    toMonth = Column(Integer)
    toYear = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('collaboration_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Discarded(db.Model):
    __tablename__ = 'discarded'

    researchEntity = Column(Integer)
    document = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('discarded_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Discardedgroup(db.Model):
    __tablename__ = 'discardedgroup'

    researchEntity = Column(Integer)
    document = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('discardedgroup_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_disseminationtalk = Table(
    'disseminationtalk', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_disseminationtalkgroup = Table(
    'disseminationtalkgroup', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


class Document(db.Model):
    __tablename__ = 'document'

    authorships = db.relationship("Authorship", back_populates="document")
    affiliations = db.relationship("Affiliation", back_populates="document")
    groupAuthorships = db.relationship("AuthorshipGroup", back_populates="document")
    title = Column(Text)
    authorsStr = Column(Text)
    authorKeywords = Column(Text)
    year = Column(Text)
    issue = Column(Text)
    volume = Column(Text)
    pages = Column(Text)
    articleNumber = Column(Text)
    doi = Column(Text)
    type = Column(Text)
    documenttype = Column(Integer)
    sourceType = Column(Text)
    itSource = Column(Text)
    scopusId = Column(Text)
    scopus_id_deleted = Column(Boolean)
    wosId = Column(Text)
    iitPublicationsId = Column(Text)
    abstract = Column(Text)
    kind = Column(Text)
    origin = Column(Text)
    synchronized = Column(Boolean)
    source_id = Column('source', Integer, db.ForeignKey('source.id'))
    source = db.relationship("Source", back_populates="documents")
    draftCreator = Column(Integer)
    draftGroupCreator = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('document_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    @staticmethod
    def get_fields():
        return [
            'authorsStr',
            'authorKeywords',
            'title',
            'year',
            'source',
            'itSource',
            'issue',
            'volume',
            'pages',
            'articleNumber',
            'doi',
            'abstract',
            'type',
            'sourceType',
            'scopusId',
            'scopus_id_deleted',
            'wosId',
            'iitPublicationsId',
            'origin',
            'kind',
            'synchronized']

    def find_copies(self, check_position = None, multiple_verification = False):
        query = Document.query
        for field_name in Document.get_fields():
            query = query.filter(getattr(Document, field_name) == getattr(self, field_name))
        query = query.filter(Document.id != self.id)
        if self.source and self.source.id:
            query = query.filter(Document.id != self.id)
        query = query.filter(Document.kind != DocumentKinds.VERIFIED.value)
        similar_documents = query.all()
        copies = [d for d in similar_documents if Authorship.equals(self.authorships, d.authorships)]
        return copies

    def get_authorship_by_position(self, position):
        return next((a for a in self.authorships if a.position == position), None)

    def get_affiliations_by_position(self, position):
        return [a for a in self.affiliations if a.authorship and a.authorship.position == position]

    def get_authors(self):
        if not self.authorsStr:
            return []
        authors = [a.strip() for a in re.sub(r'\s+et all\s*', self.authorsStr, '').split(',')]
        return authors

    def get_author_index(self, user):
        authors = [s.lower() for s in self.get_authors()]
        aliases = [s.lower() for s in user.get_aliases()]
        return next((i for (i, a) in enumerate(authors) if a in aliases), None)

    def draft_to_document(self):
        self.kind = DocumentKinds.VERIFIED.value
        self.draftCreator = None
        self.draftGroupCreator = None
        return self
    
    def is_valid(self):
        authors_str_regex = r"^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*((\s|-)?[a-zA-ZÀ-ÖØ-öø-ÿ]\.)+)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*((\s|-)?\w\.)+)*$"
        year_regex = r"^(19|20)\d{2}$"
        required_fields = [
            'authorsStr',
            'title',
            'year',
            'type',
            'sourceType'
        ]
        if self.type == DocumentTypes.INVITED_TALK:
            required_fields.append('itSource')
        else:
            required_fields.append('source')

        return all(getattr(self, f) for f in required_fields) and re.match(authors_str_regex, self.authorsStr) and re.match(year_regex, self.year)

    
    def add_missing_affiliation(self, other):
        assert other
        aus1 = self.authorships
        aus2 = other.authorships
        assert type(aus1) is list
        assert type(aus2) is list
        to_delete_authorhips = [a1 for a1 in aus1 if a1.affiliations and a1.research_entity and [a2 for a2 in aus2 if a2.position == a1.position and a2.affiliations]]
        to_add_authorships = [a2 for a2 in aus2 if next((a1 for a1 in aus1 if a1.position == a2.position), None) in to_delete_authorhips]
        for a in to_add_authorships:
            a.document = self
            db.session.add(a)
        for a in [a for a in [authorship.affiliations for authorship in to_add_authorships]]:
            a.document = self
            db.session.add(a)
        for a in to_delete_authorhips:
            db.session.delete(a)
        

    def get_draft_verification_errors(self, research_entity, doc_to_remove = None):
        if self.kind != DocumentKinds.DRAFT.value:
            return {
                'error': 'Draft not found',
                'item': None
            }
        if not self.is_valid():
            return {
                'error': 'Draft not valid for verification',
                'item': self.id
            }
        if self.scopusId:
            assert type(research_entity.get_documents()) is list
            verified_docs = [d for d in research_entity.get_documents() if d.scopuId == self.scopusId and d != doc_to_remove]
            if len(verified_docs):
                return {
                    'error': 'Draft already verified (duplicated scopusId)',
                    'item': self.id
                }

    def get_author_by_position(self, position):
        assert self.authorsStr
        return self.authorsStr.split(', ')[position]

t_documentduplicate = Table(
    'documentduplicate', metadata,
    Column('document', Integer),
    Column('duplicate', Integer),
    Column('duplicateKind', Text),
    Column('researchEntity', Integer),
    Column('researchEntityType', Text),
    Column('id', Integer)
)


class DocumentKinds(enum.Enum):
    VERIFIED = 'v'
    DRAFT = 'd'
    EXTERNAL = 'e'

    def __str__(self):
        return str(self.value)


t_documentmetric = Table(
    'documentmetric', metadata,
    Column('document', Integer),
    Column('metric', Integer)
)


class Documentnotduplicate(db.Model):
    __tablename__ = 'documentnotduplicate'

    duplicate = Column(Integer)
    document = Column(Integer)
    researchEntity = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('documentnotduplicate_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Documentnotduplicategroup(db.Model):
    __tablename__ = 'documentnotduplicategroup'

    duplicate = Column(Integer)
    document = Column(Integer)
    researchEntity = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('documentnotduplicategroup_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_documentsuggestion = Table(
    'documentsuggestion', metadata,
    Column('document', Integer),
    Column('researchEntity', Integer)
)


t_documentsuggestiongroup = Table(
    'documentsuggestiongroup', metadata,
    Column('document', Integer),
    Column('researchEntity', Integer)
)


class Documenttype(db.Model):
    __tablename__ = 'documenttype'

    key = Column(Text)
    shortLabel = Column(Text)
    label = Column(Text)
    type = Column(Text)
    highimpact = Column(Boolean)
    defaultSourceType = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('documenttype_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

class DocumentTypes(enum.Enum):
    
    ARTICLE = 'article'
    ARTICLE_IN_PRESS = 'article_in_press'
    ABSTRACT_REPORT = 'abstract_report'
    BOOK = 'book'
    BOOK_CHAPTER = 'book_chapter'
    CONFERENCE_PAPER = 'conference_paper'
    CONFERENCE_REVIEW = 'conference_review'
    EDITORIAL = 'editorial'
    ERRATUM = 'erratum'
    INVITED_TALK = 'invited_talk'
    LETTER = 'letter'
    NOTE = 'note'
    REPORT = 'report'
    REVIEW = 'review'
    SHORT_SURVEY = 'short_survey'
    PHD_THESIS = 'phd_thesis'
    POSTER = 'poster'

    def __str__(self):
        return str(self.value)


class Documenttypesourcetype(db.Model):
    __tablename__ = 'documenttypesourcetype'

    documentType = Column(Integer)
    sourceType = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('documenttypesourcetype_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Externaldocument(db.Model):
    __tablename__ = 'externaldocument'

    researchEntity = Column(Integer)
    document = Column(Integer)
    origin = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('externaldocument_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Externaldocumentgroup(db.Model):
    __tablename__ = 'externaldocumentgroup'

    researchEntity = Column(Integer)
    document = Column(Integer)
    origin = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('externaldocumentgroup_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_favoritepublication = Table(
    'favoritepublication', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_favoritepublicationgroup = Table(
    'favoritepublicationgroup', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


class Group(ResearchEntity):
    __tablename__ = 'group'    

    __mapper_args__ = {
        'polymorphic_identity': 'user',
    }

    name = Column(Text)
    slug = Column(Text)
    shortname = Column(Text)
    description = Column(Text)
    publicationsAcronym = Column(Text)
    type = Column(Text)
    code = Column(Text)
    active = Column(Boolean)
    starting_date = Column(Date)
    scopusId = Column(Text)
    institute = Column(Integer)    
    authorships = db.relationship("AuthorshipGroup", back_populates="research_entity")
    id = Column(Integer, primary_key=True, server_default=text("nextval('group_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    def get_updated_authorship(self, draft, verification_data):
                    
        authorship_group = AuthorshipGroup(draft, self)
        authorship_group.load_fields_from_dict(verification_data)
        return authorship_group

    
    def after_verify(self, document, authorhip):
        pass


class Groupadministrator(db.Model):
    __tablename__ = 'groupadministrator'

    administrator = Column(Integer)
    group = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('groupadministrator_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Groupattribute(db.Model):
    __tablename__ = 'groupattribute'

    researchEntity = Column(Integer)
    attribute = Column(Integer)
    extra = Column(JSON)
    id = Column(Integer, primary_key=True, server_default=text("nextval('groupattribute_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_highimpactpublication = Table(
    'highimpactpublication', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_highimpactpublicationgroup = Table(
    'highimpactpublicationgroup', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


class Institute(db.Model):
    __tablename__ = 'institute'

    name = Column(Text)
    country = Column(Text)
    city = Column(Text)
    shortname = Column(Text)
    scopusId = Column(Text)
    group = Column(Integer)
    aliasOf = Column(Integer)
    parentId = Column(Integer)
    affiliations = db.relationship("Affiliation", back_populates="institute")
    id = Column(Integer, primary_key=True, server_default=text("nextval('institute_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Jwt(db.Model):
    __tablename__ = 'jwt'

    token = Column(Text)
    owner = Column(Integer)
    revoked = Column(Boolean)
    id = Column(Integer, primary_key=True, server_default=text("nextval('jwt_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Membership(db.Model):
    __tablename__ = 'membership'

    user = Column(Integer)
    group = Column(Integer)
    lastsynch = Column(DateTime(True))
    active = Column(Boolean)
    synchronized = Column(Boolean)
    id = Column(Integer, primary_key=True, server_default=text("nextval('membership_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Membershipgroup(db.Model):
    __tablename__ = 'membershipgroup'

    child_group = Column(Integer)
    parent_group = Column(Integer)
    lastsynch = Column(DateTime(True))
    active = Column(Boolean)
    synchronized = Column(Boolean)
    id = Column(Integer, primary_key=True, server_default=text("nextval('membershipgroup_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Monitor(db.Model):
    __tablename__ = 'monitor'

    key = Column(Text)
    value = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('monitor_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_oralpresentation = Table(
    'oralpresentation', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


class Principalinvestigator(db.Model):
    __tablename__ = 'principalinvestigator'

    pi = Column(Integer)
    group = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('principalinvestigator_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_publication = Table(
    'publication', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_publicationgroup = Table(
    'publicationgroup', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_publicauthorship = Table(
    'publicauthorship', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_publicauthorshipgroup = Table(
    'publicauthorshipgroup', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)

class Resettoken(db.Model):
    __tablename__ = 'resettoken'

    token = Column(Text)
    owner = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('resettoken_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_scientifictalk = Table(
    'scientifictalk', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_scientifictalkgroup = Table(
    'scientifictalkgroup', metadata,
    Column('researchEntity', Integer),
    Column('document', Integer)
)


t_scopuscitation = Table(
    'scopuscitation', metadata,
    Column('document', Integer),
    Column('citation', Integer)
)


class Setting(db.Model):
    __tablename__ = 'settings'

    id = Column(Integer, primary_key=True, server_default=text("nextval('settings_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Source(db.Model):
    __tablename__ = 'source'

    title = Column(Text)
    issn = Column(Text)
    eissn = Column(Text)
    acronym = Column(Text)
    location = Column(Text)
    year = Column(Text)
    publisher = Column(Text)
    isbn = Column(Text)
    website = Column(Text)
    type = Column(Text)
    scopusId = Column(Text)
    sourcetype = Column(Integer)
    documents = db.relationship("Document", back_populates="source")
    id = Column(Integer, primary_key=True, server_default=text("nextval('source_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Sourcemetric(db.Model):
    __tablename__ = 'sourcemetric'

    origin = Column(Text)
    sourceOriginId = Column(Text)
    issn = Column(Text)
    eissn = Column(Text)
    sourceTitle = Column(Text)
    year = Column(Integer)
    name = Column(Text)
    value = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('sourcemetric_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Sourcemetricsource(db.Model):
    __tablename__ = 'sourcemetricsource'

    sourceMetric = Column(Integer)
    source = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('sourcemetricsource_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Sourcetype(db.Model):
    __tablename__ = 'sourcetype'

    key = Column(Text)
    label = Column(Text)
    section = Column(Text)
    type = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('sourcetype_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


t_subgroupsmembership = Table(
    'subgroupsmembership', metadata,
    Column('group', Integer),
    Column('user', Integer)
)


class Tag(db.Model):
    __tablename__ = 'tag'

    researchEntity = Column(Integer)
    document = Column(Integer)
    tagLabel = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('tag_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Taggroup(db.Model):
    __tablename__ = 'taggroup'

    researchEntity = Column(Integer)
    document = Column(Integer)
    tagLabel = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('taggroup_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Taglabel(db.Model):
    __tablename__ = 'taglabel'

    value = Column(Text)
    id = Column(Integer, primary_key=True, server_default=text("nextval('taglabel_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class Use(db.Model):
    __tablename__ = 'use'

    remoteAddress = Column(Text)
    jsonWebToken = Column(Integer)
    id = Column(Integer, primary_key=True, server_default=text("nextval('use_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))


class User(ResearchEntity):
    __tablename__ = 'user'

    __mapper_args__ = {
        'polymorphic_identity': 'user',
    }

    auth = Column(Integer)
    aliases = db.relationship("Alias", back_populates="user")
    username = Column(Text)
    name = Column(Text)
    surname = Column(Text)
    slug = Column(Text, unique=True)
    alreadyAccess = Column(Boolean)
    alreadyOpenedSuggested = Column(Boolean)
    role = Column(Text)
    orcidId = Column(Text)
    scopusId = Column(Text)
    jobTitle = Column(Text)
    lastsynch = Column(DateTime(True))
    active = Column(Boolean)
    synchronized = Column(Boolean)
    authorships = db.relationship("Authorship", back_populates="research_entity")
    id = Column(Integer, primary_key=True, server_default=text("nextval('user_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))

    def get_aliases(self):
        return [a.alias_str for a in self.aliases]

    def get_updated_authorship(self, draft, verification_data):
        position = verification_data.get('position', draft.get_author_index(self))
        affiliation_institute_ids = verification_data.get('affiliations', [a.institute_id for a in draft.get_affiliations_by_position(position)])
        if not affiliation_institute_ids or position is None or position < 0:
            raise UnverifiableDocumentException("Document Verify fail: affiliation or position not specified", draft)
            
        authorship = draft.get_authorship_by_position(position) or Authorship(draft, position, self)
        authorship.research_entity = self
        authorship.set_affiliations(affiliation_institute_ids)
        authorship.load_fields_from_dict(verification_data)
        return authorship

    def add_alias(self, alias_str):
        assert alias_str
        if alias_str in self.get_aliases():
            return
        alias = Alias(self, alias_str)
        db.session.add(alias)

    def after_verify(self, document, authorship):
        author_alias = document.get_author_by_position(authorship.position)
        self.add_alias(author_alias)
        

class Userattribute(db.Model):
    __tablename__ = 'userattribute'

    researchEntity = Column(Integer)
    attribute = Column(Integer)
    extra = Column(JSON)
    id = Column(Integer, primary_key=True, server_default=text("nextval('userattribute_id_seq'::regclass)"))
    createdAt = Column(DateTime(True))
    updatedAt = Column(DateTime(True))
