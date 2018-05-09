class UnverifiableDocumentException(Exception):
    
    msg = None
    document = None

    def __init__(self, msg, document):
        self.msg = msg
        self.document = document
