export type StorySlide = {
  id: number
  title: string
  srcDesktop: string
  srcMobile?: string
  alt: string
  caption: string
}

// Temporary slides using existing images under /public/images.
// Replace srcDesktop/srcMobile with your final generated assets in /public/story/.
export const storySlides: StorySlide[] = [
  {
    id: 1,
    title: "Barren Hollywood",
    srcDesktop: "/images/DSC04918-2.JPG",
    alt: "Destroyed Los Angeles street with Jadon walking, phone in hand.",
    caption: "EXT. BARREN LOS ANGELES — DAY — Jadon moves through the ruins, eyes on his phone."
  },
  {
    id: 2,
    title: "Neon Reflections",
    srcDesktop: "/images/DSC04934.JPG",
    alt: "Close-up of neon reflections in Jadon's glasses as he scrolls.",
    caption: "The feed glows — flashes, reels, and a thousand voices competing for one glance."
  },
  {
    id: 3,
    title: "Hologram Ads",
    srcDesktop: "/images/DSC04973.JPG",
    alt: "Holographic ads spiraling from the phone, wrapping around Jadon.",
    caption: "Ads spill out like holograms, tugging at his focus. Eyes red. Pulse quick."
  },
  {
    id: 4,
    title: "Hidden Nook",
    srcDesktop: "/images/DSC05110.JPG",
    alt: "A dim doorway with a small neon sign: ArtHouse.",
    caption: "In the rubble — a nearly hidden sign: ArtHouse."
  },
  {
    id: 5,
    title: "Underground Club",
    srcDesktop: "/images/DSC05137.JPG",
    alt: "Warm red/blue club of creators: musicians, filmmakers, designers.",
    caption: "INT. UNDERGROUND CLUB — Musicians tune up, filmmakers swap ideas."
  },
  {
    id: 6,
    title: "Mentor Hand",
    srcDesktop: "/images/DSC05195.JPG",
    alt: "A mentor figure steps forward, offering a hand.",
    caption: "Mentor: ‘You look like you could use a hand. Ready to get away from the noise?’"
  },
  {
    id: 7,
    title: "Collab Montage",
    srcDesktop: "/images/DSC05210.2.JPG",
    alt: "Quick flashes of storyboards, cameras, and laughter.",
    caption: "Flashes — storyboarding, shooting, cutting, sharing."
  },
  {
    id: 8,
    title: "On Set",
    srcDesktop: "/images/DSC05211.JPG",
    alt: "Jadon directs on set, headphones on, calling action.",
    caption: "EXT. SET — Jadon directs. The story breathes."
  },
  {
    id: 9,
    title: "Theatre Reveal",
    srcDesktop: "/images/DSC05213.JPG",
    alt: "Audience claps as the film ends.",
    caption: "CUT TO: Theatre applause. A film finished. A room electric."
  },
  {
    id: 10,
    title: "Award",
    srcDesktop: "/images/gasp red carpet.JPG",
    alt: "Award moment at a podium.",
    caption: "Jadon: ‘Thanks to ArtHouse — the right people, the right time.’"
  }
]



