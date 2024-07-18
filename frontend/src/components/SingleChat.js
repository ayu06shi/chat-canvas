import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import chatLogo from "../animations/chatLogo.png";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../context/ChatProvider";

const ENDPOINT = "http://localhost:5000"; //change it to the deployed url after deployment

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      // after fetching all the messages
      socket.emit("join chat", selectedChat._id);
      // with the id of this chat, we're gonna create a new room, so that logged user can join this room

    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `http://localhost:5000/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data); //new message will contain the data that we received on the called api

        setMessages([...messages, data]);

      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  // ----------------------SOCKET.IO --------------------- //
  useEffect(() => {
    socket = io(ENDPOINT); //starting socket.io
    socket.emit("setup", user); //creating a new room for this particular logged in user
    socket.on("connected", () => setSocketConnected(true)); //this means connection done
    socket.on("typing", (room) => {
      if(selectedChat && selectedChat._id === room){
        setIsTyping(true); //typing is going on
      }
    });

    socket.on("stop typing", (room) =>  {
      if(selectedChat && selectedChat._id === room) {
        setIsTyping(false); //sender is not typing
      }
    });
  }, [selectedChat]);

  useEffect(() => {
    fetchMessages();

    // backup of the selected chat state (whether we are supposed to emit the message or we are supposed to give notification)
    selectedChatCompare = selectedChat; 
  }, [selectedChat]);

  useEffect(() => {
    // if we receive anything:
    socket.on("message received", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // give notification, don't display it
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          console.log(notification);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // typing indicator logic: 
    if (!socketConnected) return;


    if (!typing) {
      setTyping(true);
      // send signal to only selected chat's room
      socket.emit("typing", selectedChat._id);
    }
    // after 3 seconds, we will stop timing
    let lastTypingTime = new Date().getTime(); //initializaion
    var timerLength = 3000; // 3 seconds
    setTimeout(() => {
      var timeNow = new Date().getTime(); //initializaion
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) { //this means if typing is still true after 3 seconds
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "18px", md: "20px" }}
            className="flex pb-3 px-3 font-sans font-bold w-[100%] justify-between"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              className="px-3"
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            className="flex flex-col justify-end p-3 w-[100%] rounded-lg h-[90%]"
            bg="#F7F7F7"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages overflow-auto">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#e8e8e8"
                placeholder="Enter a message... Press Enter Key to send"
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page   alignItems="center" justifyContent="center"  d="flex"   bg-green-50
        <Box
          className="flex items-center justify-center mx-auto rounded-md"
          h="100%"
        >
          <Text
            className="text-2xl mx-auto transition-all duration-150"
            fontFamily="Work sans"
          >
            <img src={chatLogo} className="h-32 mx-auto animate-bounce" />
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
// fontSize="2xl" pb={3}
