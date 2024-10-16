import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Table,
  Accordion,
  Group,
  Button,
  Box,
  ScrollArea,
  Anchor,
} from '@mantine/core';
import { ImageRow } from '../lib/types';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Image from 'next/image';

interface StudyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImageRow | null;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  rowIndex: number;
}

const VIEWER_URLS = [
  'https://nbia.cancerimagingarchive.net/viewer/?study=1.3.6.1.4.1.14519.5.2.1.7009.2403.267919951307803065614461706555&series=1.3.6.1.4.1.14519.5.2.1.7009.2403.123894397405213729606994397765&token=eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkZGFhMGY3YS1kZTBmLTRkYWQtYjM1ZS05MjljYjBiMTY3YjgifQ.eyJleHAiOjE3Mjc0ODAzOTksImlhdCI6MTcyNzQ3MzE5OSwianRpIjoiZTM4ODFiM2ItZmYzMi00M2YxLThhM2YtNTJmMTllZDg1ZGQ5IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1zdGcuZGJtaS5jbG91ZC9hdXRoL3JlYWxtcy9UQ0lBIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6MDE5YjU2MzQtZGFiZC00MjExLWE0MWQtNzIzYzQ0YWZjZmZkOm5iaWFfZ3Vlc3QiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJuYmlhIiwic2Vzc2lvbl9zdGF0ZSI6IjcyMWRjMjgzLTgwNmItNDY1MS04MDNlLTBjYzRmNmExMDQ0NSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly93d3cuY2FuY2VyaW1hZ2luZ2FyY2hpdmUubmV0IiwiaHR0cHM6Ly9jYW5jZXJpbWFnaW5nYXJjaGl2ZS5uZXQiLCJodHRwczovL3NlcnZpY2VzLmNhbmNlcmltYWdpbmdhcmNoaXZlLm5ldCIsImh0dHBzOi8vbmJpYS5jYW5jZXJpbWFnaW5nYXJjaGl2ZS5uZXQiLCIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtdGNpYSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjcyMWRjMjgzLTgwNmItNDY1MS04MDNlLTBjYzRmNmExMDQ0NSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiTkJJQSBHdWVzdCIsInByZWZlcnJlZF91c2VybmFtZSI6Im5iaWFfZ3Vlc3QiLCJnaXZlbl9uYW1lIjoiTkJJQSIsImZhbWlseV9uYW1lIjoiR3Vlc3QiLCJlbWFpbCI6Im5iaWFfZ3Vlc3RAY2FuY2VyaW1hZ2luZ2FyY2hpdmUubmV0In0.SrrYDfdGkgYh1IrxGGv-ReZJ1qdUhSFSSU-6ctgPCWo',
  'https://nbia.cancerimagingarchive.net/viewer/?study=1.3.6.1.4.1.14519.5.2.1.7009.2403.318789038637280076067996425746&series=1.3.6.1.4.1.14519.5.2.1.7009.2403.260443523797414261740960528504&token=eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkZGFhMGY3YS1kZTBmLTRkYWQtYjM1ZS05MjljYjBiMTY3YjgifQ.eyJleHAiOjE3Mjc0ODAzOTksImlhdCI6MTcyNzQ3MzE5OSwianRpIjoiZTM4ODFiM2ItZmYzMi00M2YxLThhM2YtNTJmMTllZDg1ZGQ5IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1zdGcuZGJtaS5jbG91ZC9hdXRoL3JlYWxtcy9UQ0lBIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6MDE5YjU2MzQtZGFiZC00MjExLWE0MWQtNzIzYzQ0YWZjZmZkOm5iaWFfZ3Vlc3QiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJuYmlhIiwic2Vzc2lvbl9zdGF0ZSI6IjcyMWRjMjgzLTgwNmItNDY1MS04MDNlLTBjYzRmNmExMDQ0NSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly93d3cuY2FuY2VyaW1hZ2luZ2FyY2hpdmUubmV0IiwiaHR0cHM6Ly9jYW5jZXJpbWFnaW5nYXJjaGl2ZS5uZXQiLCJodHRwczovL3NlcnZpY2VzLmNhbmNlcmltYWdpbmdhcmNoaXZlLm5ldCIsImh0dHBzOi8vbmJpYS5jYW5jZXJpbWFnaW5nYXJjaGl2ZS5uZXQiLCIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtdGNpYSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjcyMWRjMjgzLTgwNmItNDY1MS04MDNlLTBjYzRmNmExMDQ0NSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiTkJJQSBHdWVzdCIsInByZWZlcnJlZF91c2VybmFtZSI6Im5iaWFfZ3Vlc3QiLCJnaXZlbl9uYW1lIjoiTkJJQSIsImZhbWlseV9uYW1lIjoiR3Vlc3QiLCJlbWFpbCI6Im5iaWFfZ3Vlc3RAY2FuY2VyaW1hZ2luZ2FyY2hpdmUubmV0In0.SrrYDfdGkgYh1IrxGGv-ReZJ1qdUhSFSSU-6ctgPCWo',
];

export const StudyDetailsModal: React.FC<StudyDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  rowIndex,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('report');

  if (!data) return null;

  const generalInfo = [
    { label: 'Name', value: data.subject },
    { label: 'ID', value: data.study },
    { label: 'Patient Sex', value: data.patientsex },
    { label: 'Patient Age', value: data.patientage },
    {
      label: 'Study Date',
      value: new Date(data.studydate).toLocaleDateString(),
    },
  ];

  const imageInfo = [
    { label: 'Scanner Manufacturer', value: data.manufacturer },
    { label: 'Scanner Model Name', value: data.manufacturermodelname },
    { label: 'Series Description', value: data.seriesdescription },
    {
      label: 'Reconstruction Diameter',
      value: `${data.reconstructiondiameter} mm`,
    },
    {
      label: 'Distance Source to Detector',
      value: `${data.distancesourcetodetector} mm`,
    },
    {
      label: 'Distance Source to Patient',
      value: `${data.distancesourcetopatient} mm`,
    },
    { label: 'Gantry Detector Tilt', value: `${data.gantrydetectortilt}°` },
    { label: 'Table Height', value: `${data.tableheight} mm` },
    { label: 'Rotation Direction', value: data.rotationdirection },
    { label: 'Exposure Time', value: `${data.exposuretime} ms` },
    { label: 'X-Ray Tube Current', value: `${data.xraytubecurrent} mA` },
    { label: 'Exposure', value: `${data.exposure} mAs` },
    { label: 'Filter Type', value: data.filtertype },
    { label: 'Generator Power', value: `${data.generatorpower} kW` },
    { label: 'Focal Spots', value: data.focalspots?.join(', ') },
    { label: 'Convolution Kernel', value: data.convolutionkernel },
    { label: 'Patient Position', value: data.patientposition },
  ];

  const features = [
    { label: 'Medical Material', value: data.medical_material ? 'Yes' : 'No' },
    {
      label: 'Arterial Wall Calcification',
      value: data.arterial_wall_calcification ? 'Yes' : 'No',
    },
    { label: 'Cardiomegaly', value: data.cardiomegaly ? 'Yes' : 'No' },
    {
      label: 'Pericardial Effusion',
      value: data.pericardial_effusion ? 'Yes' : 'No',
    },
    {
      label: 'Coronary Artery Wall Calcification',
      value: data.coronary_artery_wall_calcification ? 'Yes' : 'No',
    },
    { label: 'Hiatal Hernia', value: data.hiatal_hernia ? 'Yes' : 'No' },
    { label: 'Lymphadenopathy', value: data.lymphadenopathy ? 'Yes' : 'No' },
    { label: 'Emphysema', value: data.emphysema ? 'Yes' : 'No' },
    { label: 'Atelectasis', value: data.atelectasis ? 'Yes' : 'No' },
    { label: 'Lung Nodule', value: data.lung_nodule ? 'Yes' : 'No' },
    { label: 'Lung Opacity', value: data.lung_opacity ? 'Yes' : 'No' },
    {
      label: 'Pulmonary Fibrotic Sequela',
      value: data.pulmonary_fibrotic_sequela ? 'Yes' : 'No',
    },
    { label: 'Pleural Effusion', value: data.pleural_effusion ? 'Yes' : 'No' },
    {
      label: 'Mosaic Attenuation Pattern',
      value: data.mosaic_attenuation_pattern ? 'Yes' : 'No',
    },
    {
      label: 'Peribronchial Thickening',
      value: data.peribronchial_thickening ? 'Yes' : 'No',
    },
    { label: 'Consolidation', value: data.consolidation ? 'Yes' : 'No' },
    { label: 'Bronchiectasis', value: data.bronchiectasis ? 'Yes' : 'No' },
    {
      label: 'Interlobular Septal Thickening',
      value: data.interlobular_septal_thickening ? 'Yes' : 'No',
    },
  ];

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="90%"
      title={`Case: ${data.study}`}
      classNames={{
        title: 'font-bold text-xl',
        header: 'border-b border-gray-200',
        content: 'flex flex-col',
        body: 'flex flex-col h-[90vh] overflow-hidden',
      }}
    >
      <Box className="flex-1 overflow-hidden m-2 flex">
        <Tabs
          value={activeTab}
          onTabChange={setActiveTab}
          orientation="vertical"
          className="flex-1"
        >
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="imaging">Imaging Metadata</Tabs.Tab>
            <Tabs.Tab value="report">Radiology Report</Tabs.Tab>
            <Tabs.Tab value="features">Derived Features</Tabs.Tab>
            <Tabs.Tab value="snapshots">Snapshots</Tabs.Tab>
            <Tabs.Tab value="viewer">Viewer</Tabs.Tab>
          </Tabs.List>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Tabs.Panel value="general" className="ml-4">
                <Table highlightOnHover>
                  <tbody>
                    {generalInfo.map((item, index) => (
                      <tr key={index}>
                        <td className="font-semibold">{item.label}</td>
                        <td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tabs.Panel>

              <Tabs.Panel value="imaging" className="ml-4">
                <Table highlightOnHover>
                  <tbody>
                    {imageInfo.map((item, index) => (
                      <tr key={index}>
                        <td className="font-semibold">{item.label}</td>
                        <td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tabs.Panel>

              <Tabs.Panel value="report" className="my-4 mx-8">
                <Accordion
                  multiple={true}
                  variant="contained"
                  chevronPosition="left"
                  defaultValue={['impressions', 'findings', 'clinical', 'technique']}
                  classNames={{
                    label: 'font-bold',
                    item: '',
                  }}
                >
                  <Accordion.Item value="findings">
                    <Accordion.Control>Findings</Accordion.Control>
                    <Accordion.Panel>{data.findings_en}</Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="impressions">
                    <Accordion.Control>Impressions</Accordion.Control>
                    <Accordion.Panel>{data.impressions_en}</Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="clinical">
                    <Accordion.Control>Clinical Information</Accordion.Control>
                    <Accordion.Panel>{data.clinicalinformation_en}</Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="technique">
                    <Accordion.Control>Technique</Accordion.Control>
                    <Accordion.Panel>{data.technique_en}</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Tabs.Panel>

              <Tabs.Panel value="features" className="ml-4">
                <Table highlightOnHover>
                  <tbody>
                    {features.map((item, index) => (
                      <tr key={index}>
                        <td className="font-semibold">{item.label}</td>
                        <td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tabs.Panel>

              <Tabs.Panel value="snapshots" className="mx-8 my-4">
                <div className="flex">
                  <Image
                    src={`/ss1-${rowIndex % VIEWER_URLS.length}.jpeg`}
                    alt={'Snapshot'}
                    width={400}
                    height={400}
                  />
                  <Image
                    src={`/ss2-${rowIndex % VIEWER_URLS.length}.jpeg`}
                    alt={'Snapshot'}
                    width={400}
                    height={400}
                  />
                  <Image
                    src={`/ss3-${rowIndex % VIEWER_URLS.length}.jpeg`}
                    alt={'Snapshot'}
                    width={400}
                    height={400}
                  />
                  <Image
                    src={`/ss4-${rowIndex % VIEWER_URLS.length}.jpeg`}
                    alt={'Snapshot'}
                    width={400}
                    height={400}
                  />
                </div>
                <Anchor target="_blank" href={VIEWER_URLS[rowIndex % VIEWER_URLS.length]}>
                  Open in OHIF viewer
                </Anchor>
              </Tabs.Panel>

              <Tabs.Panel value="viewer" className="mx-8 my-4">
                <iframe
                  src={VIEWER_URLS[rowIndex % VIEWER_URLS.length]}
                  style={{ height: '75vh', width: '100%' }}
                ></iframe>
              </Tabs.Panel>
            </ScrollArea>
          </div>
        </Tabs>
      </Box>
      <Box
        className="mt-2"
        sx={{
          border: '1px solid #e9ecef',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Group position="apart">
          <Button
            onClick={onPrevious}
            disabled={!hasPrevious}
            leftIcon={<IconChevronLeft size={14} />}
          >
            Previous
          </Button>
          <Button onClick={onNext} disabled={!hasNext} rightIcon={<IconChevronRight size={14} />}>
            Next
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};
