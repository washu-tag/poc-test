import weaviate, { Property, WeaviateClass } from 'weaviate-ts-client';
import { InputValues } from '@langchain/core/utils/types';
import { AttributeInfo } from 'langchain/chains/query_constructor';

interface WeaviateManagerType {
  schema: AttributeInfo[] | undefined;
  examples: InputValues[] | undefined;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  getSchema: () => AttributeInfo[];
  getExamples: () => InputValues[];
}

// Define the global variable
declare global {
  var weaviateManager: WeaviateManagerType | undefined;
}

class WeaviateManager implements WeaviateManagerType {
  schema: AttributeInfo[] | undefined;
  examples: InputValues[] | undefined;
  isInitialized: boolean = false;

  public async initialize() {
    if (this.isInitialized) {
      return;
    }

    const collection = await waitForWeaviate();
    if (!collection) {
      // Shouldn't really get here, waitForWeaviate throws for all issues that'd result in an undefined collection
      throw Error(WEAVIATE_NOT_USABLE_ERROR_MESSAGE);
    }
    this.schema = await buildSchema(collection);
    if (this.schema) {
      this.examples = await makeExamples(this.schema);
    }
    this.isInitialized = true;
    console.log('Weaviate initialized');
  }

  public getSchema(): AttributeInfo[] {
    if (!this.schema) {
      throw new Error('Weaviate not initialized');
    }
    return this.schema;
  }

  public getExamples(): InputValues[] {
    if (!this.examples) {
      throw new Error('Weaviate not initialized');
    }
    return this.examples;
  }
}

const weaviateManager = globalThis.weaviateManager ?? new WeaviateManager();
globalThis.weaviateManager = weaviateManager;
export { weaviateManager };

export const WEAVIATE_CLIENT = weaviate.client({
  scheme: `${process.env.WEAVIATE_SCHEME}`,
  host: `${process.env.WEAVIATE_HOST}`,
});

export const COLLECTION_NAME = 'CTRATE';
export const WEAVIATE_NOT_USABLE_ERROR_MESSAGE = `Weaviate is not accessible or does not have ${COLLECTION_NAME} collection`;

const waitForWeaviate: (
  maxRetries?: number,
  baseDelay?: number,
) => Promise<WeaviateClass | undefined> = async function (maxRetries = 5, baseDelay = 10 * 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if Weaviate is ready by retrieving the collection we want
      return await WEAVIATE_CLIENT.schema.classGetter().withClassName(COLLECTION_NAME).do();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw Error(WEAVIATE_NOT_USABLE_ERROR_MESSAGE, { cause: error });
      }
      console.log(`Weaviate not ready, retrying... (Attempt ${attempt + 1} of ${maxRetries})`);
      // "Sleep" for delay before retrying, with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
    }
  }
};

const buildSchema: (collection: WeaviateClass) => Promise<AttributeInfo[] | undefined> =
  async function (collection) {
    return collection.properties?.map((property: Property) => {
      const weaviate_type = property.dataType?.[0];
      const lc_type = weaviate_type ? DATA_TYPE_MAP[weaviate_type] || 'any' : 'any';
      let description = property.description;
      if (weaviate_type == 'date') {
        description +=
          " NOTE: Only use the 'eq' operator if a specific date is requested. If the user references a range, like" +
          " 'in 2020' or 'between 2010 and 2012', you should use a combination of gte and lt to request the date range.";
      }

      return new AttributeInfo(property.name || '', lc_type, description || '');
    });
  };

const makeExamples: (schema: AttributeInfo[]) => InputValues[] = function (schema) {
  const dataSource = {
    content: DOC_CONTENTS,
    attributes: schema,
  };
  const dataSourceMarkdown = jsonMarkdown(doubleBrackets(JSON.stringify(dataSource)));
  return [
    {
      i: 1,
      user_query:
        'How many chest CTs showing atelectasis in men in their 30s from 2010 to 2015 can I access?',
      data_source: dataSourceMarkdown,
      structured_request: jsonMarkdown(
        doubleBrackets(
          stringifyWithFormatting({
            query: 'abdominal CT',
            filter:
              'and(eq("atelectasis", true), eq("patientsex", "M"), lt("patientage", 40), gte("patientage", 30), lt("studydate", {"date":"2015-01-01", "type":"date"}), gte("studydate", {"date":"2010-01-01", "type":"date"}))',
          }),
        ),
      ),
    },
    {
      i: 2,
      user_query: 'Cohort of chest CTs from COVID-positive individuals',
      data_source: dataSourceMarkdown,
      structured_request: jsonMarkdown(
        doubleBrackets(
          stringifyWithFormatting({
            query: 'chest CT COVID',
            filter: 'NO_FILTER',
          }),
        ),
      ),
    },
    {
      i: 3,
      user_query:
        'Cohort of chest CTs that do not contain lesions or masses excluding males over 80 and philips scanners',
      data_source: dataSourceMarkdown,
      structured_request: jsonMarkdown(
        doubleBrackets(
          stringifyWithFormatting({
            query: 'chest CT without lesions or masses',
            filter:
              'and(or(eq("patientsex", "F"), lte("patientage", 80)), ne("manufacturer", "Philips"))',
          }),
        ),
      ),
    },
    {
      i: 4,
      user_query:
        'Cohort of abdominal CTs showing hiatal_hernia in men in their 30s in 2020 without esophageal cancer',
      data_source: dataSourceMarkdown,
      structured_request: jsonMarkdown(
        doubleBrackets(
          stringifyWithFormatting({
            query: 'abdominal CT without esophageal cancer',
            filter:
              'and(eq("hiatal_hernia", true), eq("patientsex", "M"), lt("patientage", 40), gte("patientage", 30), lt("studydate", {"date":"2021-01-01", "type":"date"}), gte("studydate", {"date":"2020-01-01", "type":"date"}))',
          }),
        ),
      ),
    },
    {
      i: 5,
      user_query: 'Cohort of emphysema patients under 80',
      data_source: dataSourceMarkdown,
      structured_request: jsonMarkdown(
        doubleBrackets(
          stringifyWithFormatting({
            query: 'NO_QUERY',
            filter: 'and(eq("emphysema", true), lt("patientage", 80))',
          }),
        ),
      ),
    },
    {
      i: 6,
      user_query: 'emphysema',
      data_source: dataSourceMarkdown,
      structured_request: jsonMarkdown(
        doubleBrackets(
          stringifyWithFormatting({
            query: 'NO_QUERY',
            filter: 'and(eq("emphysema", true))',
          }),
        ),
      ),
    },
  ];
};

export const jsonMarkdown = (input: string) => {
  return `\`\`\`json\n${input}\n\`\`\``;
};

export const stringifyWithFormatting = (input: any): string => {
  return JSON.stringify(input, null, '  ');
};

export const doubleBrackets = (input: string) => {
  return input.replace(/([{}])/g, '$1$1');
};

export const REQUEST_SCHEMA =
  '<< Structured Request Schema >>\nWhen responding use a markdown code snippet with a JSON object formatted in the following schema:\n\n\
  ```json\n{{{{\n    "query": string \\\\ text string for unstructured search of image, report, and metadata vector embeddings, use "NO_QUERY" if there is no unstructured component to the search\n    "filter": string \\\\ logical condition statement for filtering data\n}}}}\n```\n\n\
  Rules:\n\
  A logical condition statement is composed of one or more comparison and logical operation statements.\n\n\
  A comparison statement takes the form: `comp(attr, val)`:\n- `comp` ({allowed_comparators}): comparator\n- `attr` (string):  name of attribute to apply the comparison to\n- `val` (string or object if date): is the comparison value\n\n\
  A logical operation statement takes the form `op(statement1, statement2, ...)`:\n- `op` ({allowed_operators}): logical operator\n- `statement1`, `statement2`, ... (comparison statements or logical operation statements): one or more statements to apply the operation to\n\n\
  Make sure that you only use the comparators and logical operators listed above and no others.\n\
  Make sure that filters only refer to attributes that exist in the data source.\n\
  Make sure that filters only use format `YYYY-MM-DD` when handling timestamp data typed values, and return an object for val, e.g.: {{{{"date":"2020-01-01", "type":"date"}}}}\n\
  Make sure that filters take into account the descriptions of attributes and only make comparisons that are feasible given the type of data being stored.\n\
  Make sure that filters are only used as needed. If there are no filters that should be applied, return "NO_FILTER" for the filter value.\n\
  Make sure that queries are only used as needed. If only filtering is requested, return "NO_QUERY" for the query value.\n\n\
  Please review the following before returning your answer:\n\
  - Confirm that you have used a filter attribute for ALL search terms that map to data source attributes.\n\
  - Check that all your filter attributes map to data source attribute names. You CANNOT make up filter attributes.\n\
  - If there are parts of the user\'s query that are not aligned to the data source attributes, include them as part of the "query" string.\n\
  - In the "query" string, be sure to exclude words that do not contribute to meaningful semantic search, like "patients with" or "cases" or "data".\n\
  - Make sure all the impactful words in the user\'s query are handled either with a "filter" or as "query" text. Do not ignore any meaningful part of the user\'s query.\n\
  - Ensure that the result is valid JSON.\n\n';

export const ERROR_TEMPLATE =
  '{generatedQuery}\n\nError:\n\n{error}\n\nPlease correct your mistake based on the error message above.\
  If you remove a filter comparison, you should add the attribute to the query text. Make sure to add a negation for the attribute if the user asks to exclude matches.\
  Make minimal changes to your original query, just enough to address the error.\n\n\
  Fixed Structured Request:\n';

export const DATA_TYPE_MAP: any = {
  string: 'string',
  text: 'string',
  boolean: 'boolean',
  int: 'number',
  number: 'number',
  'string[]': 'list[string]',
  'number[]': 'list[number]',
  'int[]': 'list[number]',
  date: 'Date',
};

export const DOC_CONTENTS = 'CT images with radiology reports and associated metadata';

export const ATTRIBUTES = [
  'subject',
  'study',
  'volumename',
  'manufacturer',
  'seriesdescription',
  'manufacturermodelname',
  'patientsex',
  'patientage',
  'reconstructiondiameter',
  'distancesourcetodetector',
  'distancesourcetopatient',
  'gantrydetectortilt',
  'tableheight',
  'rotationdirection',
  'exposuretime',
  'xraytubecurrent',
  'exposure',
  'filtertype',
  'generatorpower',
  'focalspots',
  'convolutionkernel',
  'patientposition',
  'revolutiontime',
  'singlecollimationwidth',
  'totalcollimationwidth',
  'tablespeed',
  'tablefeedperrotation',
  'spiralpitchfactor',
  'datacollectioncenterpatient',
  'reconstructiontargetcenterpatient',
  'exposuremodulationtype',
  'ctdivol',
  'imagepositionpatient',
  'imageorientationpatient',
  'slicelocation',
  'samplesperpixel',
  'photometricinterpretation',
  'rows',
  'columns',
  'xyspacing',
  'rescaleintercept',
  'rescaleslope',
  'rescaletype',
  'numberofslices',
  'zspacing',
  'studydate',
  'medical_material',
  'arterial_wall_calcification',
  'cardiomegaly',
  'pericardial_effusion',
  'coronary_artery_wall_calcification',
  'hiatal_hernia',
  'lymphadenopathy',
  'emphysema',
  'atelectasis',
  'lung_nodule',
  'lung_opacity',
  'pulmonary_fibrotic_sequela',
  'pleural_effusion',
  'mosaic_attenuation_pattern',
  'peribronchial_thickening',
  'consolidation',
  'bronchiectasis',
  'interlobular_septal_thickening',
  'clinicalinformation_en',
  'technique_en',
  'findings_en',
  'impressions_en',
];
