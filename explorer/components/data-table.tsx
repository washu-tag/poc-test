"use client";

import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable
} from "mantine-react-table";
import { ImageRow } from "../lib/types";
import { useMemo, useState, useRef } from "react";
import { Box, Portal } from "@mantine/core";
import { useCSVDownloader } from "react-papaparse";
import { FiDownload } from "react-icons/fi";
import { ExportCohort } from "./export-cohort";
import { StudyDetailsModal } from "./study-details-modal";
import { StreamableValue, useStreamableValue } from "ai/rsc";

// Table component
export function DataTable({
  data,
  fileIdStream
}: {
  data: ImageRow[];
  fileIdStream?: StreamableValue;
}) {
  const [fileId] = useStreamableValue(fileIdStream);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previousPageSizeRef = useRef(10);

  const { CSVDownloader, Type } = useCSVDownloader();

  const columns = useMemo<MRT_ColumnDef<ImageRow>[]>(
    () => [
      // TODO using filterVariant: 'range' causes a react warning "A component is changing a controlled input to be uncontrolled"
      {
        accessorKey: "subject",
        header: "Name"
      },
      {
        accessorKey: "study",
        header: "ID"
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer"
      },
      {
        accessorKey: "seriesdescription",
        header: "Series Description"
      },
      {
        accessorKey: "manufacturermodelname",
        header: "Manufacturer Model Name"
      },
      {
        accessorKey: "patientsex",
        header: "Sex"
      },
      {
        accessorKey: "patientage",
        header: "Age",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "reconstructiondiameter",
        header: "Reconstruction Diameter",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "distancesourcetodetector",
        header: "Distance Source to Detector",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "distancesourcetopatient",
        header: "Distance Source to Patient",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "gantrydetectortilt",
        header: "Gantry Detector Tilt",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "tableheight",
        header: "Table Height",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "rotationdirection",
        header: "Rotation Direction"
      },
      {
        accessorKey: "exposuretime",
        header: "Exposure Time",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "xraytubecurrent",
        header: "X-Ray Tube Current",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "exposure",
        header: "Exposure",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "filtertype",
        header: "Filter Type"
      },
      {
        accessorKey: "generatorpower",
        header: "Generator Power",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "focalspots",
        header: "Focal Spots",
        Cell: ({ cell }) => cell.getValue<number[]>()?.toString(),
        enableColumnFilterModes: false
      },
      {
        accessorKey: "convolutionkernel",
        header: "Convolution Kernel"
      },
      {
        accessorKey: "patientposition",
        header: "Patient Position"
      },
      {
        accessorKey: "revolutiontime",
        header: "Revolution Time",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "singlecollimationwidth",
        header: "Single Collimation Width",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "totalcollimationwidth",
        header: "Total Collimation Width",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "tablespeed",
        header: "Table Speed",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "tablefeedperrotation",
        header: "Table Feed per Rotation",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "spiralpitchfactor",
        header: "Spiral Pitch Factor",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "datacollectioncenterpatient",
        header: "Data Collection Center (Patient)",
        Cell: ({ cell }) => cell.getValue<number[]>()?.toString(),
        enableColumnFilterModes: false
      },
      {
        accessorKey: "reconstructiontargetcenterpatient",
        header: "Reconstruction Target Center (Patient)",
        Cell: ({ cell }) => cell.getValue<number[]>()?.toString(),
        enableColumnFilterModes: false
      },
      {
        accessorKey: "exposuremodulationtype",
        header: "Exposure Modulation Type"
      },
      {
        accessorKey: "ctdivol",
        header: "CTDIvol",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "imagepositionpatient",
        header: "Image Position (Patient)",
        Cell: ({ cell }) => cell.getValue<number[]>()?.toString(),
        enableColumnFilterModes: false
      },
      {
        accessorKey: "imageorientationpatient",
        header: "Image Orientation (Patient)",
        Cell: ({ cell }) => cell.getValue<number[]>()?.toString(),
        enableColumnFilterModes: false
      },
      {
        accessorKey: "slicelocation",
        header: "Slice Location",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "samplesperpixel",
        header: "Samples per Pixel",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "photometricinterpretation",
        header: "Photometric Interpretation"
      },
      {
        accessorKey: "rows",
        header: "Rows",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "columns",
        header: "Columns",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "xyspacing",
        header: "Pixel Spacing",
        Cell: ({ cell }) => cell.getValue<number[]>()?.toString(),
        enableColumnFilterModes: false
      },
      {
        accessorKey: "rescaleintercept",
        header: "Rescale Intercept",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "rescaleslope",
        header: "Rescale Slope",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "rescaletype",
        header: "Rescale Type"
      },
      {
        accessorKey: "numberofslices",
        header: "Number of Slices",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "zspacing",
        header: "Slice Thickness",
        filterVariant: "range",
        enableColumnFilterModes: false
      },
      {
        id: "studydate",
        header: "Study Date",
        sortingFn: "datetime",
        accessorFn: (row: ImageRow) => new Date(row.studydate),
        filterVariant: "date-range",
        Cell: ({ cell }) =>
          cell
            .getValue<Date>()
            ?.toLocaleDateString(undefined, { timeZone: "UTC" }),
        enableColumnFilterModes: false
      },
      {
        header: "Medical Material",
        id: "medical_material",
        accessorFn: (row: ImageRow) =>
          row.medical_material ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Arterial Wall Calcification",
        id: "arterial_wall_calcification",
        accessorFn: (row: ImageRow) =>
          row.arterial_wall_calcification ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Cardiomegaly",
        id: "cardiomegaly",
        accessorFn: (row: ImageRow) => (row.cardiomegaly ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Pericardial Effusion",
        id: "pericardial_effusion",
        accessorFn: (row: ImageRow) =>
          row.pericardial_effusion ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Coronary Artery Wall Calcification",
        id: "coronary_artery_wall_calcification",
        accessorFn: (row: ImageRow) =>
          row.coronary_artery_wall_calcification ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Hiatal Hernia",
        id: "hiatal_hernia",
        accessorFn: (row: ImageRow) => (row.hiatal_hernia ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Lymphadenopathy",
        id: "lymphadenopathy",
        accessorFn: (row: ImageRow) => (row.lymphadenopathy ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Emphysema",
        id: "emphysema",
        accessorFn: (row: ImageRow) => (row.emphysema ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Atelectasis",
        id: "atelectasis",
        accessorFn: (row: ImageRow) => (row.atelectasis ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Lung Nodule",
        id: "lung_nodule",
        accessorFn: (row: ImageRow) => (row.lung_nodule ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Lung Opacity",
        id: "lung_opacity",
        accessorFn: (row: ImageRow) => (row.lung_opacity ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Pulmonary Fibrotic Sequela",
        id: "pulmonary_fibrotic_sequela",
        accessorFn: (row: ImageRow) =>
          row.pulmonary_fibrotic_sequela ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Pleural Effusion",
        id: "pleural_effusion",
        accessorFn: (row: ImageRow) =>
          row.pleural_effusion ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Mosaic Attenuation Pattern",
        id: "mosaic_attenuation_pattern",
        accessorFn: (row: ImageRow) =>
          row.mosaic_attenuation_pattern ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Peribronchial Thickening",
        id: "peribronchial_thickening",
        accessorFn: (row: ImageRow) =>
          row.peribronchial_thickening ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Consolidation",
        id: "consolidation",
        accessorFn: (row: ImageRow) => (row.consolidation ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Bronchiectasis",
        id: "bronchiectasis",
        accessorFn: (row: ImageRow) => (row.bronchiectasis ? "true" : "false"),
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        header: "Interlobular Septal Thickening",
        id: "interlobular_septal_thickening",
        accessorFn: (row: ImageRow) =>
          row.interlobular_septal_thickening ? "true" : "false",
        filterVariant: "checkbox",
        enableColumnFilterModes: false
      },
      {
        accessorKey: "clinicalinformation_en",
        header: "Clinical Information"
      },
      {
        accessorKey: "technique_en",
        header: "Technique"
      },
      {
        accessorKey: "findings_en",
        header: "Findings"
      },
      {
        accessorKey: "impressions_en",
        header: "Impressions"
      },
      {
        accessorKey: "distance",
        header: "Distance",
        filterVariant: "range",
        enableColumnFilterModes: false
      }
    ],
    []
  );

  const downloadAction = fileId
    ? () => (
        <>
          <Box
            sx={{
              display: "flex",
              gap: "16px",
              padding: "8px",
              flexWrap: "wrap"
            }}
          >
            <CSVDownloader
              type={Type.Button}
              filename={fileId}
              data={data}
              className="btn dark"
            >
              <span className="flex items-center justify-content gap-1">
                <FiDownload />
                Download CSV
              </span>
            </CSVDownloader>
            <ExportCohort data={data} />
          </Box>
        </>
      )
    : undefined;

  const handleNextRow = () => {
    if (selectedRowIndex < data.length - 1) {
      setSelectedRowIndex(selectedRowIndex + 1);
    }
  };

  const handlePreviousRow = () => {
    if (selectedRowIndex > 0) {
      setSelectedRowIndex(selectedRowIndex - 1);
    }
  };

  const table = useMantineReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableStickyFooter: true,
    enableStickyHeader: true,
    enableRowVirtualization: true,
    layoutMode: "grid",
    renderTopToolbarCustomActions: downloadAction,
    onIsFullScreenChange: () => {
      setIsFullscreen((previousFullscreenState) => {
        const newFullscreenState = !previousFullscreenState;
        if (newFullscreenState) {
          // Entering fullscreen
          previousPageSizeRef.current = table.getState().pagination.pageSize;
          table.setPageSize(30);
        } else {
          // Exiting fullscreen
          table.setPageSize(previousPageSizeRef.current);
        }
        return newFullscreenState;
      });
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setSelectedRowIndex(row.index);
        setIsModalOpen(true);
      },
      sx: {
        cursor: "pointer"
      }
    }),
    mantineTableProps: {
      sx: {
        paddingLeft: "20px"
      }
    },
    initialState: {
      density: "xs",
      columnVisibility: {
        subject: false,
        study: true,
        manufacturer: false,
        seriesdescription: false,
        manufacturermodelname: false,
        patientsex: true,
        patientage: true,
        reconstructiondiameter: false,
        distancesourcetodetector: false,
        distancesourcetopatient: false,
        gantrydetectortilt: false,
        tableheight: false,
        rotationdirection: false,
        exposuretime: false,
        xraytubecurrent: false,
        exposure: false,
        filtertype: false,
        generatorpower: false,
        focalspots: false,
        convolutionkernel: false,
        patientposition: false,
        revolutiontime: false,
        singlecollimationwidth: false,
        totalcollimationwidth: false,
        tablespeed: false,
        tablefeedperrotation: false,
        spiralpitchfactor: false,
        datacollectioncenterpatient: false,
        reconstructiontargetcenterpatient: false,
        exposuremodulationtype: false,
        ctdivol: false,
        imagepositionpatient: false,
        imageorientationpatient: false,
        slicelocation: false,
        samplesperpixel: false,
        photometricinterpretation: false,
        rows: false,
        columns: false,
        xyspacing: false,
        rescaleintercept: false,
        rescaleslope: false,
        rescaletype: false,
        numberofslices: false,
        zspacing: false,
        studydate: false,
        medical_material: false,
        arterial_wall_calcification: false,
        cardiomegaly: false,
        pericardial_effusion: false,
        coronary_artery_wall_calcification: false,
        hiatal_hernia: false,
        lymphadenopathy: false,
        emphysema: false,
        atelectasis: false,
        lung_nodule: false,
        lung_opacity: false,
        pulmonary_fibrotic_sequela: false,
        pleural_effusion: false,
        mosaic_attenuation_pattern: false,
        peribronchial_thickening: false,
        consolidation: false,
        bronchiectasis: false,
        interlobular_septal_thickening: false,
        clinicalinformation_en: false,
        technique_en: true,
        findings_en: true,
        impressions_en: true,
        distance: true
      }
    }
  });

  const tableComponent = <MantineReactTable table={table} />;

  return (
    <>
      {isFullscreen ? (
        <Portal>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              backgroundColor: "white"
            }}
          >
            {tableComponent}
          </div>
        </Portal>
      ) : (
        <>
          {tableComponent}
          <StudyDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={data[selectedRowIndex]}
            onNext={handleNextRow}
            onPrevious={handlePreviousRow}
            hasNext={selectedRowIndex < data.length - 1}
            hasPrevious={selectedRowIndex > 0}
            rowIndex={selectedRowIndex}
          />
        </>
      )}
    </>
  );
}
