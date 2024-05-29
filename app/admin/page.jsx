'use client'

import React, {useEffect, useState} from 'react';
import {getUsers, handleAddUser, handleDeleteUser, handleEditUser} from "../../services/api";
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
    Tooltip,
    useDisclosure,
    User
} from "@nextui-org/react";
import {EditIcon} from "../../components/EditIcon";
import {DeleteIcon} from "../../components/DeleteIcon";
import {toast, ToastContainer} from "react-toastify";
import {PlusIcon} from "../../components/PlusIcon";
import {useRouter} from "next/navigation";

const columns = [
    {name: "USER", uid: "user"},
    {name: "ROLE", uid: "role"},
    {name: "ACTIONS", uid: "actions"},
];

const statusColorMap = {
    user: "success",
    manager: "warning",
    admin: "danger",
};

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        // Fetch all users when the component mounts
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            console.log("USERS!", response)
            setUsers(response);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const renderCell = (user, columnKey) => {
        const cellValue = user[columnKey];

        switch (columnKey) {
            case "user":
                return (
                    <User
                        description={user.email}
                        name={user.email}
                    >
                        {user.email}
                    </User>
                );
            case "role":
                return (
                    <Chip className="capitalize" color={statusColorMap[user.role]} size="sm" variant="flat">
                        {cellValue}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    onClick={() => handleEdit(user)}>
                <EditIcon/>
              </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete task" closeDelay={50} style={{pointerEvents: "none"}}>
              <span className="text-lg text-danger cursor-pointer active:opacity-50"
                    onClick={() => handleDelete(user._id)}>
                <DeleteIcon/>
              </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }

    const handleAdd = () => {
        setNewUser(newUser);
        onAddOpen();
    }

    const {isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose} = useDisclosure();
    const [newUser, setNewUser] = useState({
        email: "",
        role: "user"
    });
    const renderAddModal = () => {
        return (
            <Modal backdrop="blur" isOpen={isAddOpen} onClose={onAddClose}>
                <ModalContent>
                    {(onAddClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add New User</ModalHeader>
                            <ModalBody>
                                <User
                                    description={newUser.email}
                                    name={newUser.email}
                                >
                                    {newUser.email}
                                </User>
                                <Textarea
                                    fullWidth={true}
                                    isRequired={true}
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                />
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            variant="bordered"
                                        >
                                            <Chip className="capitalize" color={statusColorMap[newUser.role]} size="sm"
                                                  variant="flat">
                                                {newUser.role}
                                            </Chip>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Action event example"
                                        onAction={(key) => {
                                            setNewUser({...newUser, role: key})
                                        }}
                                    >
                                        <DropdownItem key="user"><Chip className="capitalize"
                                                                       color={statusColorMap['user']} size="sm"
                                                                       variant="flat">
                                            User
                                        </Chip></DropdownItem>
                                        <DropdownItem key="manager"><Chip className="capitalize"
                                                                          color={statusColorMap['manager']} size="sm"
                                                                          variant="flat">
                                            Manager
                                        </Chip></DropdownItem>
                                        <DropdownItem key="admin"><Chip className="capitalize"
                                                                        color={statusColorMap['admin']} size="sm"
                                                                        variant="flat">
                                            Admin
                                        </Chip></DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onAddClose}>
                                    Cancel
                                </Button>
                                <Button onPress={async () => {
                                    try {
                                        onAddClose();
                                        const res = await handleAddUser(newUser);
                                        if (typeof res === 'string') toast.error(res);
                                        else
                                            setNewUser({
                                                email: "",
                                                role: "user"
                                            })
                                            fetchUsers();
                                    } catch (error) {
                                        toast.error("Failed to add user. Please try again later.");
                                        console.error("Add user error:", error);
                                    }
                                }}
                                >
                                    Submit
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        )
    }


    const {isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose} = useDisclosure();
    const [editUser, setEditUser] = useState();
    const handleEdit = (user) => {
        setEditUser(user);
        onEditOpen();
    }
    const renderEditModal = () => {
        return (
            <Modal backdrop="blur" isOpen={isEditOpen} onClose={onEditClose}>
                <ModalContent>
                    {(onEditClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Edit User</ModalHeader>
                            <ModalBody>
                                <User
                                    description={editUser.email}
                                    name={editUser.email}
                                >
                                    {editUser.email}
                                </User>
                                <Textarea
                                    fullWidth={true}
                                    isRequired={true}
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                                />
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            variant="bordered"
                                        >
                                            <Chip className="capitalize" color={statusColorMap[editUser.role]} size="sm"
                                                  variant="flat">
                                                {editUser.role}
                                            </Chip>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Action event example"
                                        onAction={(key) => {
                                            setEditUser({...editUser, role: key})
                                        }}
                                    >
                                        <DropdownItem key="user"><Chip className="capitalize"
                                                                       color={statusColorMap['user']} size="sm"
                                                                       variant="flat">
                                            User
                                        </Chip></DropdownItem>
                                        <DropdownItem key="manager"><Chip className="capitalize"
                                                                          color={statusColorMap['manager']} size="sm"
                                                                          variant="flat">
                                            Manager
                                        </Chip></DropdownItem>
                                        <DropdownItem key="admin"><Chip className="capitalize"
                                                                        color={statusColorMap['admin']} size="sm"
                                                                        variant="flat">
                                            Admin
                                        </Chip></DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onEditClose}>
                                    Cancel
                                </Button>
                                <Button onPress={async () => {
                                    try {
                                        onEditClose();
                                        const res = await handleEditUser(editUser);
                                        if (typeof res === 'string') toast.error(res);
                                        else
                                            setUsers(prevUsers => prevUsers.map(user => {
                                                if (user._id === editUser._id) {
                                                    return editUser;
                                                } else {
                                                    return user;
                                                }
                                            }));
                                    } catch (error) {
                                        toast.error("Failed to edit user. Please try again later.");
                                        console.error("Edit user error:", error);
                                    }
                                }}
                                >
                                    Submit
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        )
    }

    const handleDelete = async (userId) => {
        try {
            const res = await handleDeleteUser(userId);
            if (typeof res === 'string') toast.error(res);
            else
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        } catch (error) {
            toast.error("Failed to delete user. Please try again later.");
            console.error("Delete user error:", error);
        }
    }

    return (
        <>
            <div className="flex justify-between gap-3 m-3">
                <div className="flex gap-3">
                    <Button onClick={() => handleAdd()} endContent={<PlusIcon/>}>
                        Add New User
                    </Button>
                </div>
            </div>
            <Table aria-label="Example table with custom cells">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={users}>
                    {(item) => (
                        <TableRow key={item._id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex justify-between gap-3 m-3">
                <div className="flex gap-3">
                    <Button onClick={() => router.push('/')}>
                        Go to Todos
                    </Button>
                </div>
            </div>
            {renderAddModal()}
            {renderEditModal()}
            <ToastContainer/>
        </>
    );
};

export default AdminDashboard;
