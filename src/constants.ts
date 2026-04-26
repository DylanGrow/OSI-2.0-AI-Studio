/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from './types.ts';

export const OSI_LAYERS = [
  "Physical",
  "Data Link",
  "Network",
  "Transport",
  "Session",
  "Presentation",
  "Application"
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Which layer is responsible for routing packets across different networks using logical addressing (IP)?",
    options: ["Data Link", "Network", "Transport", "Session"],
    correctAnswer: 1,
    explanation: "The Network layer (Layer 3) handles logical addressing and path determination (routing).",
    layer: 3
  },
  {
    id: "q2",
    text: "At which layer would you find hardware like hubs and repeaters?",
    options: ["Physical", "Data Link", "Network", "Transport"],
    correctAnswer: 0,
    explanation: "Layer 1 (Physical) deals with bit-level transmission and hardware like cables, hubs, and repeaters.",
    layer: 1
  },
  {
    id: "q3",
    text: "Which layer defines the rules for syntax, encryption, and compression of data?",
    options: ["Application", "Presentation", "Session", "Transport"],
    correctAnswer: 1,
    explanation: "The Presentation layer (Layer 6) ensures that data is in a usable format and handles encryption/compression.",
    layer: 6
  },
  {
    id: "q4",
    text: "Segmentation and reassembly of data into 'segments' occurs at which layer?",
    options: ["Network", "Data Link", "Transport", "Session"],
    correctAnswer: 2,
    explanation: "The Transport layer (Layer 4) manages end-to-end communication, including segmentation and error checking.",
    layer: 4
  },
  {
    id: "q5",
    text: "Which layer is responsible for node-to-node delivery and handles physical addressing (MAC)?",
    options: ["Network", "Physical", "Data Link", "Transport"],
    correctAnswer: 2,
    explanation: "The Data Link layer (Layer 2) provides node-to-node data transfer and manages MAC addresses.",
    layer: 2
  },
  {
    id: "q6",
    text: "At which layer do protocols like HTTP, FTP, and SMTP operate?",
    options: ["Presentation", "Session", "Application", "Transport"],
    correctAnswer: 2,
    explanation: "The Application layer (Layer 7) is closest to the end-user and supports network services for applications.",
    layer: 7
  },
  {
    id: "q7",
    text: "This layer manages connections, including starting, stopping, and maintaining communication synchronization.",
    options: ["Transport", "Session", "Presentation", "Application"],
    correctAnswer: 1,
    explanation: "The Session layer (Layer 5) establishes, manages, and terminates connections between applications.",
    layer: 5
  },
  {
    id: "q8",
    text: "What is the correct order of the OSI layers from Layer 1 to Layer 7?",
    options: [
      "Application, Presentation, Session, Transport, Network, Data Link, Physical",
      "Physical, Data Link, Network, Transport, Session, Presentation, Application",
      "Physical, Network, Data Link, Transport, Session, Presentation, Application",
      "Data Link, Physical, Network, Transport, Session, Presentation, Application"
    ],
    correctAnswer: 1,
    explanation: "The order from Layer 1 to 7 is Physical, Data Link, Network, Transport, Session, Presentation, and Application.",
  },
  {
    id: "q9",
    text: "What is the Protocol Data Unit (PDU) at the Network Layer (Layer 3)?",
    options: ["Frame", "Segment", "Packet", "Bit"],
    correctAnswer: 2,
    explanation: "At Layer 3 (Network), the PDU is called a 'Packet'.",
    layer: 3
  },
  {
    id: "q10",
    text: "Which layer provides flow control and error-free point-to-point delivery?",
    options: ["Data Link", "Network", "Transport", "Session"],
    correctAnswer: 2,
    explanation: "The Transport layer (Layer 4) ensures source-to-destination (end-to-end) delivery of the entire message.",
    layer: 4
  }
];
