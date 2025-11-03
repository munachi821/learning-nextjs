export interface Event {
  title: string;
  image: string; // path under public/images, e.g. /images/xxx.jpg
  slug: string;
  location: string;
  date: string; // human-friendly date or range
  time: string; // optional start time
}

export const events: Event[] = [
  {
    title: "JSConf EU 2026",
    image: "/images/event1.png",
    slug: "jsconf-eu-2026",
    location: "Berlin, Germany",
    date: "June 10-12, 2026",
    time: "09:00",
  },
  {
    title: "React Summit 2026",
    image: "/images/event2.png",
    slug: "react-summit-2026",
    location: "Amsterdam, Netherlands",
    date: "April 21-22, 2026",
    time: "09:30",
  },
  {
    title: "KubeCon + CloudNativeCon Europe 2026",
    image: "/images/event3.png",
    slug: "kubecon-cloudnative-eu-2026",
    location: "Barcelona, Spain",
    date: "May 5-8, 2026",
    time: "08:30",
  },
  {
    title: "PyCon US 2026",
    image: "/images/event4.png",
    slug: "pycon-us-2026",
    location: "Salt Lake City, USA",
    date: "April 15-23, 2026",
    time: "10:00",
  },
  {
    title: "HackMIT Fall 2025",
    image: "/images/event5.png",
    slug: "hackmit-fall-2025",
    location: "Cambridge, MA, USA",
    date: "November 21-23, 2025",
    time: "18:00",
  },
  {
    title: "NodeConf EU 2026",
    image: "/images/event6.png",
    slug: "nodeconf-eu-2026",
    location: "Lisbon, Portugal",
    date: "March 3-4, 2026",
    time: "09:00",
  },
];
