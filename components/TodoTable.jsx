"use client"
import React, {useEffect, useState} from "react";
import {
    Button,
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
    useDisclosure
} from "@nextui-org/react";
import {EditIcon} from "./EditIcon";
import {DeleteIcon} from "./DeleteIcon";
// import {columns} from "./data";
import {addTodo, deleteTodo, editTodo} from "../services/api";
import {ChevronDownIcon} from "./ChevronDownIcon";
import {PlusIcon} from "./PlusIcon";
import {capitalize} from "./utils";
import {uuid} from "uuidv4";

const colors = ["default", "primary", "secondary", "success", "warning", "danger"];
const columns = [
    {name: "", uid: "text"},
    {name: "ACTIONS", uid: "actions"},
];

const TodoTable = ({tasks, selectedColor, setSelectedColor}) => {
    const [taskList, setTaskList] = useState(tasks);
    useEffect(() => {
        const storedTasks = JSON.parse(localStorage.getItem("tasks"));
        if (storedTasks) {
            setTaskList(storedTasks);
        }
        const handleStorageChange = (event) => {
            if (event.key === "tasks") {
                setTaskList(JSON.parse(event.newValue));
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }, [taskList]);

    const {isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose} = useDisclosure();
    const [editTask, setEditTask] = React.useState();
    const renderEditModal = () => {
        return (
            <Modal backdrop="blur" isOpen={isEditOpen} onClose={onEditClose}>
                <ModalContent>
                    {(onEditClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Edit Task</ModalHeader>
                            <ModalBody>
                                <Textarea
                                    fullWidth={true}
                                    isRequired={true}
                                    value={editTask.text}
                                    onChange={(e) => setEditTask({...editTask, text: e.target.value})}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onEditClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={async () => {
                                    onEditClose();
                                    await editTodo(editTask);
                                    setTaskList(prevTaskList => prevTaskList.map(task => {
                                        if (task.id === editTask.id) {
                                            return editTask;
                                        } else {
                                            return task;
                                        }
                                    }));
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

    const handleEdit = (task) => {
        setEditTask(task);
        onEditOpen();
    }

    const {isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose} = useDisclosure();
    const [newTask, setNewTask] = React.useState("");
    const renderAddModal = () => {
        return (
            <Modal backdrop="blur" isOpen={isAddOpen} onClose={onAddClose}>
                <ModalContent>
                    {(onAddClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add New Task</ModalHeader>
                            <ModalBody>
                                <Textarea
                                    fullWidth={true}
                                    isRequired={true}
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onAddClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={async () => {
                                    onAddClose();
                                    await addTodo({
                                        id: uuid(),
                                        text: newTask
                                    });
                                    setTaskList(prevTaskList => {
                                        return [...prevTaskList, {
                                            id: uuid(),
                                            text: newTask
                                        }];
                                    });
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
    const handleAdd = () => {
        setNewTask("");
        onAddOpen();
    }

    const handleDelete = async (taskId) => {
        await deleteTodo(taskId);
        setTaskList(prevTaskList => prevTaskList.filter(task => task.id !== taskId));
    }


    const renderCell = React.useCallback((task, columnKey) => {
        const cellValue = task[columnKey];

        switch (columnKey) {
            case "text":
                return (
                    <div
                    >
                        {task.text}
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit task" closeDelay={50} style={{pointerEvents: "none"}}>
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    onClick={() => handleEdit(task)}>
                <EditIcon/>
              </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete task" closeDelay={50} style={{pointerEvents: "none"}}>
              <span className="text-lg text-danger cursor-pointer active:opacity-50"
                    onClick={() => handleDelete(task.id)}>
                <DeleteIcon/>
              </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    return (
        <>
            <div className="flex justify-between gap-3 m-3">
                <Button variant="ghost" color={selectedColor}>
                    Done
                </Button>
                <div className="flex gap-3">
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button color={selectedColor} endContent={<ChevronDownIcon className="text-small"/>}
                                    variant="flat">
                                Color
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            disallowEmptySelection
                            selectionMode="single"
                        >
                            {colors.map((color) => (
                                <DropdownItem key={color} color={color} onPress={() => setSelectedColor(color)}
                                              className="capitalize">
                                    {capitalize(color)}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Button onClick={handleAdd} color={selectedColor} endContent={<PlusIcon/>}>
                        Add New
                    </Button>
                </div>
            </div>
            <Table color={selectedColor}
                   selectionMode="multiple"
                   isStriped aria-label="Todos">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align="end">
                            {column.name}
                        </TableColumn>

                    )}
                </TableHeader>
                <TableBody items={taskList}>
                    {(task) => (
                        <TableRow key={task.id}>
                            {(columnKey) => <TableCell>{renderCell(task, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {renderAddModal()}
            {renderEditModal()}
        </>
    );
}

export default TodoTable;