const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/models/creator-card');
const { serializeCard } = require('./create');

const retrieveCardSpec = `root {
  slug string<trim>
  access_code? string<trim>
}`;

const parsedRetrieveCardSpec = validator.parse(retrieveCardSpec);

async function retrieveCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedRetrieveCardSpec);

  try {
    const card = await CreatorCard.findOne({ slug: data.slug, deleted: null });

    // Rule 1: card does not exist
    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }

    // Rule 2: card is a draft
    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF02');
    }

    // Rule 3: card is private and no access_code supplied
    if (card.access_type === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.PRIVATE_NO_CODE, 'AC03');
    }

    // Rule 4: card is private and access_code doesn't match
    if (card.access_type === 'private' && data.access_code !== card.access_code) {
      throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, 'AC04');
    }

    const serialized = serializeCard(card);

    // Never expose access_code in retrieval responses
    delete serialized.access_code;

    response = serialized;
  } catch (error) {
    appLogger.errorX(error, 'retrieve-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = retrieveCreatorCard;
