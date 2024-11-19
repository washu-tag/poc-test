export interface ImageRow {
  // The DICOM subject label.
  subject: string;

  // The DICOM study label.
  study: string;

  // The file name.
  volumename: string;

  // Manufacturer of the equipment that produced the Composite Instances.
  manufacturer: string;

  // Description of the Series.
  seriesdescription: string;

  // Manufacturer's model name of the equipment that is to be used for beam delivery.
  manufacturermodelname: string;

  // Sex of the named Patient.
  patientsex: string;

  // Age of the Patient.
  patientage: number;

  // Diameter, in mm, of the region from within which the data was used in creating the reconstruction of the image. Data may exist outside this region and portions of the patient may exist outside this region.
  reconstructiondiameter: number;

  // Distance in mm from source to detector center.
  distancesourcetodetector: number;

  // Distance in mm from source to the table, support or bucky side that is closest to the Imaging Subject, as measured along the central ray of the X-Ray beam.
  distancesourcetopatient: number;

  // Nominal angle of tilt in degrees of the scanning gantry. Not intended for mathematical computations.
  gantrydetectortilt: number;

  // The height of the patient table in mm. The range and values of this element are determined by the manufacturer.
  tableheight: number;

  // Direction of rotation of the source when relevant, about nearest principal axis of equipment.
  rotationdirection: string;

  // Duration of X-Ray exposure in msec.
  exposuretime: number;

  // X-Ray Tube Current in mA.
  xraytubecurrent: number;

  // The exposure expressed in mAs, for example calculated from Exposure Time and X-Ray Tube Current.
  exposure: number;

  // Type of filter(s) inserted into the X-Ray beam (e.g., wedges).
  filtertype: string;

  // Power in kW to the X-Ray generator.
  generatorpower: number;

  // Nominal focal spot size in mm used to acquire this image.
  focalspots: number[];

  // A label describing the convolution kernel or algorithm used to reconstruct the data. A single value shall be present.
  convolutionkernel: string;

  // Patient position descriptor relative to the equipment.
  patientposition: string;

  // The time in seconds of a complete revolution of the source around the gantry orbit.
  revolutiontime: number;

  // Adjacent physical detector rows may have been combined to form a single effective acquisition row.
  singlecollimationwidth: number;

  // This will be equal the number of effective detector rows multiplied by single collimation width.
  totalcollimationwidth: number;

  // The distance in mm that the table moves in one second during the gathering of data that resulted in this image.
  tablespeed: number;

  // Motion of the table (in mm) during a complete revolution of the source around the gantry orbit.
  tablefeedperrotation: number;

  // Ratio of the Table Feed per Rotation to the Total Collimation Width.
  spiralpitchfactor: number;

  // The x, y, and z coordinates (in the Patient-Based Coordinate System) in mm of the center of the region in which data were collected.
  datacollectioncenterpatient: number[];

  // If the reconstructed image is not magnified or panned the value corresponds with the Data Collection Center Attribute.
  reconstructiontargetcenterpatient: number[];

  // A multi-valued label describing the type of current modulation used for the purpose of limiting the dose.
  exposuremodulationtype: string;

  // It describes the average dose for this image for the selected CT conditions of operation.
  ctdivol: number;

  // Image Position specifies the x, y, and z coordinates of the upper left hand corner of the image; it is the center of the first voxel transmitted.
  imagepositionpatient: number[];

  // Image Orientation specifies the direction cosines of the first row and the first column with respect to the patient.
  imageorientationpatient: number[];

  // Slice Location is defined as the relative position of the image plane expressed in mm. This information is relative to an unspecified implementation specific reference point.
  slicelocation: number;

  // Samples per Pixel is the number of separate planes in this image.
  samplesperpixel: number;

  // The value of Photometric Interpretation specifies the intended interpretation of the image pixel data.
  photometricinterpretation: string;

  // Number of rows in the image.
  rows: number;

  // Number of columns in the image.
  columns: number;

  // Physical distance between the center of each pixel along the x and y axes, respectively, in the patient.
  xyspacing: number[];

  // The value b in relationship between stored values (SV) and the output units.
  rescaleintercept: number;

  // m in the equation specified by Rescale Intercept.
  rescaleslope: number;

  // Specifies the output units of Rescale Slope and Rescale Intercept.
  rescaletype: string;

  // Number of slices.
  numberofslices: number;

  // Physical distance between the center of each pixel along the z axis in the patient.
  zspacing: number;

  // Date the Study started.
  studydate: Date;

  // Indicates the presence of medical material.
  medical_material: boolean;

  // Indicates the presence of arterial wall calcification.
  arterial_wall_calcification: boolean;

  // Indicates the presence of cardiomegaly.
  cardiomegaly: boolean;

  // Indicates the presence of pericardial effusion.
  pericardial_effusion: boolean;

  // Indicates the presence of coronary artery wall calcification.
  coronary_artery_wall_calcification: boolean;

  // Indicates the presence of a hiatal hernia.
  hiatal_hernia: boolean;

  // Indicates the presence of lymphadenopathy.
  lymphadenopathy: boolean;

  // Indicates the presence of emphysema.
  emphysema: boolean;

  // Indicates the presence of atelectasis.
  atelectasis: boolean;

  // Indicates the presence of lung nodules.
  lung_nodule: boolean;

  // Indicates the presence of lung opacity.
  lung_opacity: boolean;

  // Indicates the presence of pulmonary fibrotic sequela.
  pulmonary_fibrotic_sequela: boolean;

  // Indicates the presence of pleural effusion.
  pleural_effusion: boolean;

  // Indicates the presence of a mosaic attenuation pattern.
  mosaic_attenuation_pattern: boolean;

  // Indicates the presence of peribronchial thickening.
  peribronchial_thickening: boolean;

  // Indicates the presence of consolidation.
  consolidation: boolean;

  // Indicates the presence of bronchiectasis.
  bronchiectasis: boolean;

  // Indicates the presence of interlobular septal thickening.
  interlobular_septal_thickening: boolean;

  // Clinical information in English.
  clinicalinformation_en: string;

  // Technique description in English.
  technique_en: string;

  // Findings description in English.
  findings_en: string;

  // Impressions description in English.
  impressions_en: string;

  // The distance
  distance: number;
}
