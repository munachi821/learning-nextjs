import Hello from "@/components/Hello";

const Home = () => {
  console.log("What type of a component am i?");

  return (
    <main>
      <div className="text-4xl">Welcome to Next.js</div>
      <Hello />
    </main>
  );
};
export default Home;
