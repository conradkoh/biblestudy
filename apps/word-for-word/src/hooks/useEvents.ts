import EventEmitter from "eventemitter3";
import { useEffect } from "react";

export type CommonEventTypes = {
  ON_CHAPTER_CHANGE: () => void;
};

export const CommonEvents = new EventEmitter<CommonEventTypes>();

export function useEvent<
  EventTypes extends EventEmitter.ValidEventTypes,
  EventKey extends EventEmitter.EventNames<EventTypes>,
>(
  emitter: EventEmitter<EventTypes>,
  eventKey: EventKey,
  callback: EventEmitter.EventListener<EventTypes, EventKey>,
  effectDependencies: any[] = []
) {
  useEffect(() => {
    emitter.on(eventKey, callback);

    return () => {
      emitter.off(eventKey, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitter, callback, eventKey, ...effectDependencies]);
}
