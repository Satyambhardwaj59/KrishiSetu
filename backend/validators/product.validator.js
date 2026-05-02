const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string()
    .valid('cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'spices', 'cotton', 'sugarcane', 'other')
    .required(),
  description: Joi.string().max(1000).optional(),

  quantity: Joi.object({
    value: Joi.number().positive().required(),
    unit: Joi.string().valid('kg', 'quintal', 'ton', 'litre', 'dozen', 'piece').default('kg'),
  }).required(),

  price: Joi.object({
    value: Joi.number().min(1).required(),
    currency: Joi.string().default('INR'),
    unit: Joi.string().optional(),
  }).required(),

  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string().optional(),
  }).optional(),

  harvestDate: Joi.date().optional(),
  expiryDate: Joi.date().greater(Joi.ref('harvestDate')).optional(),
  isOrganic: Joi.boolean().default(false),
  quality: Joi.string().valid('Premium', 'Grade A', 'Grade B', 'Average').default('Grade A'),
});

const updateProductSchema = productSchema.fork(
  ['name', 'category', 'quantity', 'price'],
  (field) => field.optional()
);

module.exports = { productSchema, updateProductSchema };
