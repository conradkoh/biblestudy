import type { OptionSelectorConfig } from "@/src/components/option-selector-bottom-sheet";
import type { InputBottomSheetConfig } from "@/src/components/input-bottom-sheet";
import EventEmitter from "eventemitter3";
import { useEffect } from "react";
import { BibleCursor } from "@common/utils/bible-data-utils";

export type CommonEventTypes = {
  SHOW_TOAST: {
    message: string;
    duration?: number;
  };
  SHOW_OPTION_SELECTOR_BOTTOM_SHEET: OptionSelectorConfig;
  SHOW_INPUT_BOTTOM_SHEET: InputBottomSheetConfig;
  HIGHLIGHT_VERSE: {
    cursor: BibleCursor;
    duration?: number;
  }
};

export const CommonEvents = new EventEmitter<CommonEventTypes>();

export function useEvent<
  EventTypes extends EventEmitter.ValidEventTypes,
  EventKey extends EventEmitter.EventNames<EventTypes>,
>(
  emitter: EventEmitter<EventTypes>,
  eventKey: EventKey,
  callback: EventEmitter.EventListener<EventTypes, EventKey>,
  effectDependencies: unknown[] = [],
) {
  useEffect(() => {
    emitter.on(eventKey, callback);

    return () => {
      emitter.off(eventKey, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitter, callback, eventKey, ...effectDependencies]);
}
