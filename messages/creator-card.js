const CreatorCardMessages = {
  CARD_CREATED: 'Creator card created successfully.',
  CARD_RETRIEVED: 'Creator card retrieved successfully.',
  CARD_DELETED: 'Creator card deleted successfully.',

  SLUG_TAKEN: 'Slug is already taken',

  ACCESS_CODE_REQUIRED: 'access_code is required when access_type is private',
  ACCESS_CODE_FORBIDDEN: 'access_code can only be set on private cards',
  PRIVATE_NO_CODE: 'This card is private. An access code is required',
  INVALID_ACCESS_CODE: 'Invalid access code',

  CARD_NOT_FOUND: 'Creator card not found',
};

const CreatorCardErrorCodes = {
  SLUG_TAKEN: 'SL02',
  ACCESS_CODE_REQUIRED: 'AC01',
  ACCESS_CODE_FORBIDDEN: 'AC05',
  CARD_NOT_FOUND: 'NF01',
  CARD_IS_DRAFT: 'NF02',
  PRIVATE_NO_CODE: 'AC03',
  INVALID_ACCESS_CODE: 'AC04',
};

module.exports = { CreatorCardMessages, CreatorCardErrorCodes };
