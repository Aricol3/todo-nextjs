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
import {useDispatch} from "react-redux";
import {setTodos} from "../redux-toolkit/slices/todoSlice";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const colors = ["default", "primary", "secondary", "success", "warning", "danger"];
const columns = [
    {name: "", uid: "text"},
    {name: "ACTIONS", uid: "actions"},
];

const TodoTable = ({tasks, selectedColor, setSelectedColor}) => {
    const [taskList, setTaskList] = useState(tasks);
    useEffect(() => {
        setTaskList(tasks);
    }, [tasks]);

    const [selectedKeys, setSelectedKeys] = React.useState(new Set());
    const dispatch = useDispatch();
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
        dispatch(setTodos(taskList))
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
                                <Button color={selectedColor} onPress={async () => {
                                    try {
                                        onEditClose();
                                        await editTodo(editTask);
                                        setTaskList(prevTaskList => prevTaskList.map(task => {
                                            if (task.id === editTask.id) {
                                                return editTask;
                                            } else {
                                                return task;
                                            }
                                        }));
                                    } catch (error) {
                                        toast.error("Failed to edit task. Please try again later.");
                                        console.error("Edit task error:", error);
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
                                <Button color={selectedColor} onPress={async () => {
                                    try {
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
                                    } catch (error) {
                                        toast.error("Failed to add task. Please try again later.");
                                        console.error("Add task error:", error);
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
    const handleAdd = () => {
        setNewTask("");
        onAddOpen();
    }

    const handleBulkDelete = () => {
        if (selectedKeys === "all") {
            taskList.forEach(async (task) => {
                await handleDelete(task.id);
            })
        } else {
            selectedKeys.forEach(async (taskID) => {
                await handleDelete(taskID);
            })
        }
    }

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(taskList)], {type: 'application/json'});

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'todos.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDelete = async (taskId) => {
        try {
            await deleteTodo(taskId);
            setTaskList(prevTaskList => prevTaskList.filter(task => task.id !== taskId));
        } catch (error) {
            toast.error("Failed to delete task. Please try again later.");
            console.error("Delete task error:", error);
        }
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
                    <Button onClick={handleBulkDelete} color="danger">
                        Delete Selected
                    </Button>
                    <Button onClick={handleAdd} color={selectedColor} endContent={<PlusIcon/>}>
                        Add New
                    </Button>
                </div>
            </div>
            <Table color={selectedColor}
                   selectionMode="multiple"
                   onSelectionChange={setSelectedKeys}
                   onRowAction={() => {
                   }}
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
            <Button className="m-3" onClick={handleDownload} color={selectedColor}>
                Download list
            </Button>
            {renderAddModal()}
            {renderEditModal()}
            <ToastContainer/>
        </>
    );
}

export default TodoTable;