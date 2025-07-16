import { keyframes } from "@emotion/react";

export const shake = keyframes`
  0%   { transform: scale(1.12) translate(-50%, -50%) translateX(0); }
  10%  { transform: scale(1.12) translate(-50%, -50%) translateX(-8px); }
  20%  { transform: scale(1.12) translate(-50%, -50%) translateX(8px); }
  30%  { transform: scale(1.12) translate(-50%, -50%) translateX(-8px); }
  40%  { transform: scale(1.12) translate(-50%, -50%) translateX(8px); }
  50%  { transform: scale(1.12) translate(-50%, -50%) translateX(-8px); }
  60%  { transform: scale(1.12) translate(-50%, -50%) translateX(8px); }
  70%  { transform: scale(1.12) translate(-50%, -50%) translateX(-8px); }
  80%  { transform: scale(1.12) translate(-50%, -50%) translateX(8px); }
  90%  { transform: scale(1.12) translate(-50%, -50%) translateX(-8px); }
  100% { transform: scale(1.12) translate(-50%, -50%) translateX(0); }
`;

export const moveToCenter = keyframes`
  0% { transform: scale(1) translate(0, 0); opacity: 1; }
  60% { transform: scale(1.08) translate(0, 0); opacity: 1; }
  100% { transform: scale(1.12) translate(-50%, -50%); opacity: 1; z-index: 1300; }
`;
