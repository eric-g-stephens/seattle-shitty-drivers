export const BEHAVIORS = [
  { code: "red_light",         label: "Ran a red light" },
  { code: "stop_sign",         label: "Blew through a stop sign" },
  { code: "tailgating",        label: "Tailgating" },
  { code: "unsafe_pass",       label: "Unsafe passing / lane change" },
  { code: "speeding",          label: "Speeding" },
  { code: "no_yield_ped",      label: "Didn't yield to pedestrians" },
  { code: "block_crosswalk",   label: "Blocked the crosswalk" },
  { code: "block_box",         label: "Blocked the intersection" },
  { code: "phone",             label: "On their phone / distracted" },
  { code: "no_signal",         label: "No turn signal" },
  { code: "bike_lane_drive",   label: "Driving in the bike lane" },
  { code: "bike_lane_block",   label: "Blocked the bike lane" },
  { code: "road_rage",         label: "Aggressive driving / road rage" },
  { code: "cutoff",            label: "Cut someone off" },
  { code: "illegal_uturn",     label: "Illegal U-turn" },
  { code: "wrong_way",         label: "Wrong-way driving" },
  { code: "no_emergency",      label: "Didn't yield to emergency vehicle" },
  { code: "merge_fail",        label: "Wouldn't zipper merge" },
  { code: "no_headlights",     label: "Driving without headlights" },
  { code: "parking_violation", label: "Parked illegally (hydrant, crosswalk, bike lane)" },
] as const;

export type BehaviorCode = typeof BEHAVIORS[number]["code"];

export const BEHAVIOR_MAP = Object.fromEntries(
  BEHAVIORS.map((b) => [b.code, b.label])
) as Record<BehaviorCode, string>;
