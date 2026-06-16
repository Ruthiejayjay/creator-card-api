const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { ulid } = require('@app-core/randomness');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/models/creator-card');

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

function serializeCard(card) {
  const obj = card.toObject ? card.toObject() : { ...card };
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
}

async function createCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(parsedCreateCardSpec, serviceData);

  try {
    const accessType = data.access_type || 'public';

    // Business rule: access_code required when private
    if (accessType === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, 'AC01');
    }

    // Business rule: access_code must not be set on public cards
    if (accessType === 'public' && data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_FORBIDDEN, 'AC05');
    }

    let { slug } = data;

    if (slug) {
      // Client provided slug - check uniqueness
      const existing = await CreatorCard.findOne({ slug, deleted: null });
      if (existing) {
        throwAppError(CreatorCardMessages.SLUG_TAKEN, 'SL02');
      }
    } else {
      // Auto-generate slug from title
      slug = generateSlugFromTitle(data.title);

      if (slug.length < 5) {
        slug = `${slug}-${generateSuffix()}`;
      } else {
        const existing = await CreatorCard.findOne({ slug, deleted: null });
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
