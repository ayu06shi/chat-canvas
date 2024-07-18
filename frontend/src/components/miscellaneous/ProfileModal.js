import {
  Avatar,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
// import { ChatState } from "../../context/ChatProvider";

const ProfileModal = ({ user, children }) => {
//   const { user } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if(!user) return null;
  
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <i
          class="ri-user-3-fill p-1 text-xl cursor-pointer rounded-md bg-green-100 transition-all duration-200"
          onClick={onOpen}
        ></i>
      )}

      <Modal size="md" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent h="380px">
          <ModalHeader className="text-6xl text-center font-bold font-sans mb-2">
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="flex flex-col items-center justify-between">
            <Image
              className="rounded-md mx-auto"
              boxSize="170px"
              src={user.pic}
              alt={user.name}
            />
            <Text className="text-2xl text-center">Email: {user.email}</Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
