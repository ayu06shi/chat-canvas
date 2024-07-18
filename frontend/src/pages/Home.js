import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useEffect } from "react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useHistory } from "react-router-dom";
import chatLogo from '../animations/chatLogo.png'

const Home = () => {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={1}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <div className="flex">
         <p className="m-auto font-bold text-2xl bg-green-50 p-2 px-3 rounded-t-2xl">Chat Canvas</p> <img src={chatLogo}  className="h-20 mx-auto"/>
        </div>
      </Box>
      <div className="container bg-white rounded-md p-2">
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList mb="1em" className="justify-evenly">
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Signup</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      </Container>
  );
};

export default Home;
