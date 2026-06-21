const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { ulid } = require('@app-core/randomness');
const { CreatorCardMessages, CreatorCardErrorCodes } = require('@app/messages/creator-card');
const CreatorCard = require('@app/models/creator-card');
const { CardStatus, AccessType } = require('./enums');

const createCardSpec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedCreateCardSpec = validator.parse(createCardSpec);

function generateSlugFromTitle(title) {
  let slug = title.toLowerCase();
  slug = slug.split(' ').join('-');
  slug = slug
    .split('')
    .filter((c) => 'abcdefghijklmnopqrstuvwxyz0123456789-_'.includes(c))
    .join('');
  return slug;
}

function generateSuffix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return suffix;
}

function serializeCard(card, options = {}) {
  const { excludeAccessCode = false } = options;
  const obj = card.toObject ? card.toObject() : { ...card };
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;

  if (excludeAccessCode) {
    delete obj.access_code;
  }

  return obj;
}

async function createCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedCreateCardSpec);

  try {
    const accessType = data.access_type || AccessType.PUBLIC;

    if (accessType === AccessType.PRIVATE && !data.access_code) {
      throwAppError(
        CreatorCardMessages.ACCESS_CODE_REQUIRED,
        CreatorCardErrorCodes.ACCESS_CODE_REQUIRED
      );
    }

    if (accessType === AccessType.PUBLIC && data.access_code) {
      throwAppError(
        CreatorCardMessages.ACCESS_CODE_FORBIDDEN,
        CreatorCardErrorCodes.ACCESS_CODE_FORBIDDEN
      );
    }

    let { slug } = data;

    if (slug) {
      const existing = await CreatorCard.findOne({ slug });
      if (existing) {
        throwAppError(CreatorCardMessages.SLUG_TAKEN, CreatorCardErrorCodes.SLUG_TAKEN);
      }
    } else {
      slug = generateSlugFromTitle(data.title);

      if (slug.length < 5) {
        slug = `${slug}-${generateSuffix()}`;
      } else {
        const existing = await CreatorCard.findOne({ slug });
        if (existing) {
          slug = `${slug}-${generateSuffix()}`;
        }
      }
    }

    const now = Date.now();

    const card = new CreatorCard({
      _id: ulid(),
      title: data.title,
      description: data.description,
      slug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates || null,
      status: data.status,
      access_type: accessType,
      access_code: data.access_code || null,
      created: now,
      updated: now,
      deleted: null,
    });

    await card.save();

    response = serializeCard(card);
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = { createCreatorCard, serializeCard };
