"use client"
import React, {useState} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Radio,
    RadioGroup,
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
import {columns} from "./data";
import {deleteTodo, editTodo} from "../services/api";

const statusColorMap = {
    active: "success",
    paused: "danger",
    vacation: "warning",
};

const colors = ["default", "primary", "secondary", "success", "warning", "danger"];


const TodoTable = ({tasks}) => {
    const [taskList, setTaskList] = useState(tasks);
    const [selectedColor, setSelectedColor] = useState("default");
    const [selectedKeys, setSelectedKeys] = useState(new Set(["2"]));


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

    const handleDelete = async (taskId) => {
        console.log("AA", taskId);
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
            <Table color={selectedColor}
                   selectionMode="multiple"
                   isStriped aria-label="Example table with custom cells">
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
            <RadioGroup
                label="Selection color"
                orientation="horizontal"
                value={selectedColor}
                onValueChange={setSelectedColor}
            >
                {colors.map((color) => (
                    <Radio
                        key={color}
                        color={color}
                        value={color}
                        className="capitalize"
                    >
                        {color}
                    </Radio>
                ))}
            </RadioGroup>
            {renderEditModal()}
        </>
    );
}

export default TodoTable;