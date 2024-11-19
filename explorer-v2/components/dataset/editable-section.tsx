import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { SearchForm } from '../search-form';
import { UseChatContext } from '@/context/use-chat-context';
import { Step } from '@/lib/types';

export const EditableSection = ({
  textInput,
  inputType,
  maxDistance,
  resultLimit,
  step,
  datasetId,
  children,
}: {
  textInput?: string;
  inputType: 'text' | 'textarea' | 'none';
  maxDistance: number;
  resultLimit: number;
  step: Step;
  datasetId?: string;
  children: React.ReactNode;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { setInput } = useContext(UseChatContext);

  useEffect(() => {
    if (textInput) {
      setIsEditing(false);
    }
  }, [textInput]);

  return (
    <Card className="w-full">
      <CardContent>
        {isEditing ? (
          <SearchForm
            inputType={inputType}
            step={step}
            datasetId={datasetId}
            defaultValue={textInput}
            maxDistance={maxDistance}
            resultLimit={resultLimit}
            offerClose={true}
            closeAction={() => {
              if (textInput) {
                setInput(textInput);
              }
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="flex justify-between items-center">
            {children}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
