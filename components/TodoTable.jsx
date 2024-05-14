"use client"
import React, {useEffect, useRef, useState} from "react";
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
    useDisclosure,
} from "@nextui-org/react";
import {EditIcon} from "./EditIcon";
import {DeleteIcon} from "./DeleteIcon";
import {addTodo, deleteTodo, editTodo, getAllTodos} from "../services/api";
import {ChevronDownIcon} from "./ChevronDownIcon";
import {PlusIcon} from "./PlusIcon";
import {capitalize} from "./utils";
import {useDispatch} from "react-redux";
import {setTodos} from "../redux-toolkit/slices/todoSlice";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TodoTable.css";
import {AddIcon} from "./AddIcon";


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
                                            if (task._id === editTask._id) {
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
    const [parentTaskId, setParentTaskId] = React.useState("");
    const renderAddModal = () => {
        return (
            <Modal backdrop="blur" isOpen={isAddOpen} onClose={onAddClose}>
                <ModalContent>
                    {(onAddClose) => (
                        <>
                            <ModalHeader
                                className="flex flex-col gap-1">{parentTaskId ? "Add New Subtask" : "Add New task"}</ModalHeader>
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
                                        const createdTask = await addTodo({
                                            text: newTask,
                                            parentId: parentTaskId
                                        });
                                        setTaskList(prevTaskList => {
                                            return [createdTask, ...prevTaskList];
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
    const handleAdd = (parent = "") => {
        setParentTaskId(parent)
        setNewTask("");
        onAddOpen();
    }

    const handleBulkDelete = () => {
        if (selectedKeys === "all") {
            taskList.forEach(async (task) => {
                await handleDelete(task._id);
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
            setTaskList(prevTaskList => prevTaskList.filter(task => task._id !== taskId));
        } catch (error) {
            toast.error("Failed to delete task. Please try again later.");
            console.error("Delete task error:", error);
        }
    }
    const [lastCellSet, setLastCellSet] = useState(false);

    const renderCell = (task, columnKey) => {
        const cellValue = task[columnKey];
        const taskIndex = mergedTaskList.findIndex((item) => item._id === task._id);
        let isLast = false;
        setLastCellSet(false);
        if (taskIndex === mergedTaskList.length - 1) {
            isLast = true;
            console.log("cat este?", taskIndex, mergedTaskList - 1)
            console.log("asd", lastRef.current)
            console.log("ISLAST?", isLast)
            setLastCellSet(true);
        }

        switch (columnKey) {
            case "text":
                return (
                    <div ref={isLast ? lastRef : null}
                    >
                        {task.text}
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        {!task.parentId ?
                            <Tooltip content="Add subtask" closeDelay={50} style={{pointerEvents: "none"}}>
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    onClick={() => handleAdd(task._id)}>
                <AddIcon/>
              </span>
                            </Tooltip> : ""}
                        <Tooltip content="Edit task" closeDelay={50} style={{pointerEvents: "none"}}>
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    onClick={() => handleEdit(task)}>
                <EditIcon/>
              </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete task" closeDelay={50} style={{pointerEvents: "none"}}>
              <span className="text-lg text-danger cursor-pointer active:opacity-50"
                    onClick={() => handleDelete(task._id)}>
                <DeleteIcon/>
              </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }

    const mergedTaskList = taskList.reduce((acc, task) => {
        if (task.parentId === "") {
            acc.push(task);
            const subTasks = taskList.filter(subTask => subTask.parentId === task._id);
            acc.push(...subTasks);
        }

        return acc;
    }, []);

    const lastRef = useRef(null);
    const [limit, setLimit] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        console.log("ASDASD!#@!#@!#!@", lastRef?.current)
        if (!lastRef?.current) return;

        const observer = new IntersectionObserver(async ([entry]) => {
            if (entry.isIntersecting) {
                if (!isFetching) {
                    setIsFetching(true);

                    const newTasks = await getAllTodos({page: currentPage + 1, limit, time: "DESC"});
                    console.log("BAAA LOADING????")

                    if (newTasks.length > 0) {
                        setCurrentPage(prevPage => prevPage + 1);
                        setTaskList(prevTasks => [...prevTasks, ...newTasks]);
                    }

                    setIsFetching(false);
                }
            }
        });

        observer.observe(lastRef.current);

        return () => observer.disconnect();
    }, [lastRef, lastCellSet,limit, currentPage, isFetching]);


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
                    <Button onClick={() => handleAdd()} color={selectedColor} endContent={<PlusIcon/>}>
                        Add New
                    </Button>
                </div>
            </div>
            <Table color={selectedColor}
                   selectionMode="multiple"
                   onSelectionChange={setSelectedKeys}
                   onRowAction={() => {
                   }}
                   isStriped aria-label="Todos"
                   className="todoTable"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align="end">
                            {column.name}
                        </TableColumn>

                    )}
                </TableHeader>
                <TableBody items={mergedTaskList}
                >
                    {(task) => (
                        <TableRow key={task._id} className={`${task.parentId ? "subTask" : ""}`}>
                            {(columnKey) => {
                                return <TableCell>{renderCell(task, columnKey)}</TableCell>
                            }}
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