import { ClientMessage } from '@/lib/chat/actions';
import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiCpu } from 'react-icons/fi';
import Message, { EncodedImage, UserMessage } from './message';
import { generateId } from 'ai';
import { readStreamableValue, StreamableValue, useActions, useUIState } from 'ai/rsc';
import ModelSelect from './model-select';
import { ActionIcon, Tooltip } from '@mantine/core';
import { CopilotForm } from './copilot-form';
import { DEFAULT_MODEL } from '@/lib/models';

export function Copilot({
  chatId,
  isExpanded,
  updateSearchName,
  setCohortDisplayFromMessage,
  setCopilotExpanded,
}: {
  chatId: string;
  isExpanded: boolean;
  updateSearchName: (input: string) => void;
  setCohortDisplayFromMessage: (message: ClientMessage) => void;
  setCopilotExpanded: (expanded: boolean) => void;
}) {
  const { continueConversation, abortConversation } = useActions();
  const [conversation, setConversation] = useUIState();
  const [input, setInput] = useState('');
  const [images, setImages] = useState<EncodedImage[]>([]);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [messageActive, setMessageActive] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    setConversation([]);
    setImages([]);
    setMessageActive(false);
  }, [chatId, setConversation]);

  useEffect(() => {
    if (!messageActive) {
      textInputRef.current?.focus();
    }
  }, [messageActive]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatExpansion = () => {
    setCopilotExpanded(!isExpanded);
  };

  const updateImages = async (fileList: FileList) => {
    const currentImages: EncodedImage[] = [];
    for (const attachment of Array.from(fileList)) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          resolve(readerEvent.target?.result as string);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(attachment);
      });

      const parts = dataUrl.split(',');
      currentImages.push({
        mime: parts[0],
        image: parts[1],
      });
    }

    setImages((previousImages) => previousImages.concat(currentImages));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (!input) {
        setInput('Build a cohort of images like this');
      }

      updateImages(event.target.files);
    }
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(event.target.value);
  };

  const handleSubmission = async () => {
    setMessageActive(true);

    if (conversation.length === 0) {
      updateSearchName(input);
    }

    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      {
        id: generateId(),
        role: 'user',
        display: <UserMessage input={input} images={images} />,
      },
    ]);

    doSubmit(input, images);
    setInput('');
    setImages([]);
  };

  const doSubmit = async (question: string, encodedImages: EncodedImage[]) => {
    const message = (await continueConversation(
      question,
      model,
      encodedImages.map((encodedImage) => encodedImage.image),
    )) as ClientMessage;

    setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
    setCohortDisplayFromMessage(message);
    for await (const messageInProgress of readStreamableValue(
      message.inProgress as StreamableValue<boolean>,
    )) {
      setMessageActive(!!messageInProgress);
    }
  };

  const abort = () => {
    abortConversation();
  };

  return (
    <div className={`${isExpanded ? 'sticky top-0 flex flex-col justify-end h-screen' : ''}`}>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'flex max-h-screen mr-4' : 'fixed bottom-0 right-4 z-50'
        }`}
      >
        <div className={`flex flex-col max-w-full my-4 ${isExpanded ? 'shadow-lg' : ''}`}>
          {isExpanded ? (
            <div className="bg-blue-500 text-white p-2 rounded-t-lg flex items-center">
              <span className="mx-2 uppercase tracking-widest text-xl">Copilot</span>
              <ModelSelect model={model} handleModelChange={handleModelChange} />
              <span
                className={`cursor-pointer ml-auto transition-transform duration-300`}
                onClick={toggleChatExpansion}
              >
                <FiChevronDown />
              </span>
            </div>
          ) : (
            <Tooltip label="Copilot" position="left" withArrow>
              <ActionIcon
                variant="filled"
                color="blue"
                size={100} // Increase the size of the ActionIcon
                className="hover:bg-blue-800 shadow-lg m-5 rounded-full"
                onClick={toggleChatExpansion}
              >
                <FiCpu size={50} />
              </ActionIcon>
            </Tooltip>
          )}

          <div className={`bg-white overflow-y-auto max-h-full ${isExpanded ? '' : 'hidden'}`}>
            {conversation.map((message: ClientMessage) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <CopilotForm
            isExpanded={isExpanded}
            images={images}
            input={input}
            messageActive={messageActive}
            handleFileChange={handleFileChange}
            setInput={setInput}
            handleSubmission={handleSubmission}
            abort={abort}
            textInputRef={textInputRef}
          />
        </div>
      </div>
    </div>
  );
}
