from .base_parser import BaseParser
from .hsbc_parser import HSBCParser
from .dbs_parser import DBSParser
from .ocbc_parser import OCBCParser
from .citibank_parser import CitibankParser
from .scb_parser import SCBParser
from .trust_parser import TrustParser
from .gxs_parser import GXSParser

BANK_PARSERS = {
    "HSBC": HSBCParser,
    "DBS": DBSParser,
    "OCBC": OCBCParser,
    "Citibank": CitibankParser,
    "SCB": SCBParser,
    "Trust": TrustParser,
    "GXS": GXSParser,
}

def get_parser(bank_name: str):
    parser_class = BANK_PARSERS.get(bank_name)
    if parser_class:
        return parser_class()
    return None
