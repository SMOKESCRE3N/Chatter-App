import React from "react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  return (
    <div className="h-screen bg-gray-950 flex overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default Home;

