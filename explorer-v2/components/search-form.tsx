import { Loader, X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useContext } from 'react';
import { UseChatContext } from '@/context/use-chat-context';
import { MAX_RESULT_LIMIT, Step } from '@/lib/types';
import { Textarea } from './ui/textarea';

export function SearchForm({
  inputType,
  step,
  datasetId,
  defaultValue,
  placeholder,
  maxDistance,
  resultLimit,
  offerClose,
  closeAction,
}: {
  inputType: 'text' | 'textarea' | 'none';
  step: Step;
  datasetId?: string;
  defaultValue?: string;
  placeholder?: string;
  maxDistance: number;
  resultLimit: number;
  offerClose: boolean;
  closeAction?: () => void;
}) {
  const { submitForm, isLoading, setInput, stop, setMaxDistance, setResultLimit } =
    useContext(UseChatContext);

  const doSubmit = () => submitForm(step, datasetId);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 space-y-4">
          {(() => {
            // TODO is this an antipattern?
            switch (inputType) {
              case 'text':
                return (
                  <Input
                    type="text"
                    autoFocus
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    disabled={isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doSubmit()}
                  />
                );
              case 'textarea':
                return (
                  <Textarea
                    autoFocus
                    rows={6}
                    defaultValue={defaultValue}
                    disabled={isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && doSubmit()}
                    className="my-4"
                  />
                );
              case 'none':
                return null;
            }
          })()}
          <div className="flex space-x-2">
            <Button className="flex-1" disabled={isLoading} onClick={doSubmit}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
            {isLoading && (
              <Button variant="outline" onClick={stop}>
                Stop
              </Button>
            )}
          </div>
        </div>

        <div className="w-48 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Distance</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-48">
                      Cosine distance threshold for similarity matching. Lower values mean stricter
                      matching.{' '}
                      <a href="#" className="text-accent-foreground underline">
                        Help me set this
                      </a>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="ml-auto text-xs text-muted-foreground">
                {maxDistance.toFixed(2)}
              </span>
            </div>
            <Slider
              defaultValue={[maxDistance]}
              onValueChange={(values) => setMaxDistance(values[0])}
              min={0}
              max={2}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Results</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-48">Maximum number of results to return from the search.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              defaultValue={resultLimit}
              onChange={(e) => setResultLimit(Number(e.target.value))}
              min={1}
              max={MAX_RESULT_LIMIT}
              className="w-full h-8 text-xs"
            />
          </div>
        </div>

        {offerClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-2" onClick={closeAction}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
