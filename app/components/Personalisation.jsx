export const tagMappings = [
  {
    title: 'Low FODMAP',
    tag: 'diet-Low FODMAP',
    typeform: 'low fodmap',
    filter_type: 'tags',
    description:
      'certified to be low FODMAP by the experts at Monash University.',
    group: 'range',
    not_rule: true,
  },
  {
    title: 'Lean + Lighter',
    tag: 'lean-lighter',
    typeform: 'lighter',
    filter_type: 'tags',
    group: 'range',
    not_rule: false,
  },
  {
    title: 'Mediterranean',
    tag: 'diet-Mediterranean',
    typeform: 'mediterranean',
    filter_type: 'tags',
    group: 'range',
    not_rule: false,
  },
  {
    title: 'All ranges',
    tag: 'diet-none',
    filter_type: 'tags',
    group: 'range',
    not_rule: false,
  },
  {
    title: 'Overall Health',
    tag: 'health-Wellbeing',
    typeform: 'overall',
    filter_type: 'sorts',
    group: 'diet goal',
    not_rule: false,
  },
  {
    title: 'Plant Diversity',
    tag: 'health-Diversity',
    filter_type: 'sorts',
    typeform: 'diversity',
    group: 'diet goal',
    not_rule: false,
  },
  {
    title: 'Lowest Sugar',
    tag: 'health-sugar',
    filter_type: 'sorts',
    typeform: 'sugar',
    group: 'diet goal',
    not_rule: true,
  },
  {
    title: 'Lowest Carb',
    tag: 'diet-Lowest Carb',
    typeform: 'lowest carb',
    filter_type: 'sorts',
    group: 'diet goal',
    not_rule: true,
  },
  {
    title: 'Increased Fibre',
    tag: 'health-fibre',
    filter_type: 'sorts',
    typeform: 'fibre',
    group: 'diet goal',
    not_rule: false,
  },
  {
    title: 'Higher Protein',
    tag: 'diet-High Protein',
    typeform: 'protein',
    filter_type: 'sorts',
    group: 'diet goal',
    not_rule: true,
  },
  {
    title: 'Lower Saturated Fat',
    tag: 'diet-Low Sat Fat',
    filter_type: 'sorts',
    typeform: 'saturated',
    group: 'diet goal',
    not_rule: true,
  },
  {
    title: 'Lowest Calorie',
    tag: 'sort-calories',
    description: 'offering you the lowest calorie meals that fit your needs',
    typeform: 'calorie',
    filter_type: 'sorts',
    group: 'diet goal',
    not_rule: true,
  },
  {
    title: 'I eat everything',
    tag: 'diet-anything',
    description:
      'chosen from a variety of meals, including meat and plant-based',
    filter_type: 'tags',
    typeform: 'everything',
    hide: true,
    group: 'dietary style',
    not_rule: false,
  },
  {
    title: 'Vegan',
    tag: 'diet-vegan',
    filter_type: 'tags',
    typeform: 'vegan',
    group: 'dietary style',
    not_rule: true,
  },
  {
    title: 'Vegetarian',
    tag: 'diet-vegetarian',
    filter_type: 'tags',
    typeform: 'vegetarian',
    group: 'dietary style',
    not_rule: true,
  },
  {
    title: 'Pescatarian',
    tag: 'diet-pescatarian',
    filter_type: 'tags',
    typeform: 'pescatarian',
    group: 'dietary style',
    not_rule: true,
  },
  {
    title: 'Flexitarian',
    tag: 'diet-flexitarian',
    filter_type: 'tags',
    typeform: 'flexitarian',
    group: 'dietary style',
    not_rule: false,
  },
  {
    title: 'Gluten Free',
    tag: 'free-gluten',
    description: 'coeliac safe meals, not containing gluten',
    filter_type: 'tags',
    typeform: 'gluten',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Dairy Free',
    tag: 'free-dairy',
    filter_type: 'tags',
    typeform: 'dairy',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Celery Free',
    tag: 'free-celery',
    filter_type: 'tags',
    typeform: 'celery',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Peanut Free',
    tag: 'free-peanuts',
    filter_type: 'tags',
    typeform: 'peanuts',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Tree Nut Free',
    tag: 'free-tree nuts',
    filter_type: 'tags',
    typeform: 'tree nuts',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Soy Free',
    tag: 'free-soy',
    filter_type: 'tags',
    typeform: 'soy',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Sesame Free',
    tag: 'free-sesame',
    filter_type: 'tags',
    typeform: 'sesame',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Mollusc Free',
    tag: 'free-mollusc',
    filter_type: 'tags',
    typeform: 'mollusc',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Mustard Free',
    tag: 'free-mustard',
    filter_type: 'tags',
    typeform: 'mustard',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Lupin Free',
    tag: 'free-lupin',
    filter_type: 'tags',
    typeform: 'lupin',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Egg Free',
    tag: 'free-egg',
    filter_type: 'tags',
    typeform: 'egg',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Fish Free',
    tag: 'free-fish',
    filter_type: 'tags',
    description: 'meals not containing fish',
    typeform: 'fish',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Crustacean Free',
    tag: 'free-crustacean',
    filter_type: 'tags',
    typeform: 'crustacean',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Onion Free',
    tag: 'free-onion',
    filter_type: 'tags',
    typeform: 'onion',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Sulphites Free',
    tag: 'free-sulphites',
    filter_type: 'tags',
    typeform: 'sulphites',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Tomato Free',
    tag: 'free-tomato',
    filter_type: 'tags',
    typeform: 'tomato',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Mushroom Free',
    tag: 'free-mushroom',
    filter_type: 'tags',
    typeform: 'mushroom',
    group: 'allergen',
    not_rule: true,
  },
  {
    title: 'Support Immune System',
    tag: 'health-immunity',
    filter_type: 'sorts',
    typeform: 'immune',
    group: 'health goal',
    not_rule: false,
  },
  {
    title: 'Maintain Bones',
    tag: 'health-bones',
    filter_type: 'sorts',
    typeform: 'bones',
    group: 'health goal',
    not_rule: false,
  },
  {
    title: 'Maintain Muscle',
    tag: 'health-muscles',
    filter_type: 'sorts',
    typeform: 'muscle',
    description: 'meals with a higher protein content',
    group: 'health goal',
    not_rule: false,
  },
  {
    title: 'Reduce Tiredness or Fatigue',
    tag: 'health-energy',
    filter_type: 'sorts',
    typeform: 'fatigue',
    group: 'health goal',
    not_rule: false,
  },
  {
    title: 'Maintain Vision',
    tag: 'health-eye',
    filter_type: 'sorts',
    typeform: 'vision',
    group: 'health goal',
    not_rule: false,
  },
  {
    title: 'Support Psychological Function',
    tag: 'health-brain',
    filter_type: 'sorts',
    typeform: 'psychological',
    group: 'health goal',
    not_rule: false,
  },
];

export function getTagObjects(tags) {
  const tagObjects = [];
  tagMappings.forEach((tag) => {
    if (tags.includes(tag.tag)) {
      tagObjects.push(tag);
    }
  });
  return tagObjects;
}
