import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

/**
 * Pre-configured actor hook. Returns the backend actor and loading state.
 * All data operations go through this hook → actor methods.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return {
    actor,
    isReady: !!actor && !isFetching,
    isFetching,
  };
}
