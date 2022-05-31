import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Button, Input, List, notification, Typography } from "antd";
import axios from "axios";
import "antd/dist/antd.css";
import { TaskItem } from "./TaskItem";

export type Task = {
  id: string;
  title: string;
  assigneeEmail?: string;
  updatedDate: number;
  status: "todo" | "in-progress" | "done";
};

export type TasksApi = {
  getTasks: (dto: {
    pageSize: number;
    page: number;
  }) => Promise<{ total: number; tasks: Task[] }>;
  addTask: (dto: { title: string }) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setStatus: (id: string, status: Task["status"]) => Promise<Task>;
  setAssignee: (id: string, assigneeEmail: string | undefined) => Promise<Task>;
};

const API_BASE_URL = 'https://flyde.app/apps/admin1/issue-tracker'

const createApi = (baseUrl: string): TasksApi => ({
  getTasks: (dto) =>
    axios
      .get(
        `${baseUrl}/tasks?pageSize=${dto.pageSize}&page=${dto.page}`
      )
      .then((res) => res.data),
  addTask: (dto) =>
    axios
      .post(`${baseUrl}/tasks`, dto)
      .then((res) => res.data),
  deleteTask: (id) =>
    axios.delete(`${baseUrl}/tasks/${id}`),
  setStatus: (id, status) =>
    axios.put(
      `${baseUrl}/tasks/${id}/status`,
      { status }
    ).then(r => r.data),
  setAssignee: (id, assigneeEmail) =>
    axios.put(
      `${baseUrl}/tasks/${id}/assignee`,
      { assigneeEmail }
    ).then(r => r.data),
});

function App() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [baseUrl, setBaseUrl] = useState(API_BASE_URL);

  // const [page, setPage] = React.useState(1);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [api, setApi] = useState(createApi(API_BASE_URL));

  useEffect(() => {
    setApi(createApi(baseUrl));
  }, [baseUrl])

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await api.getTasks({ pageSize: 10, page: 1 });
      setTasks(result.tasks);
      setLoading(false);
    };
    fetchData();
  }, [api]);

  const onAddTask = useCallback(() => {
    api.addTask({ title: newTaskTitle }).then((task) => {
      notification.success({ message: "Task added" });
      setTasks([task, ...tasks]);
      setNewTaskTitle("");
    });
  }, [newTaskTitle, tasks, api]);

  const header = (
    <div>
      <Typography.Title level={2}>Tasks</Typography.Title>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {" "}
        <Input
          style={{ flex: 1 }}
          placeholder={`New task's title goes here`}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <Button onClick={onAddTask}>Add Task</Button>
      </div>
    </div>
  );

  const onDelete = useCallback(
    (task: Task) => {
      api.deleteTask(task.id).then(() => {
        notification.success({ message: "Task deleted" });
        setTasks(tasks.filter((t) => t.id !== task.id));
      });
    },
    [tasks, api]
  );

  const onChangeAssignee = useCallback(
    (task: Task, assigneeEmail: string | undefined) => {
      return api.setAssignee(task.id, assigneeEmail).then((task) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        notification.success({ message: "Task updated" });
        return task;
      });
    },
    [tasks, api]
  );

  const onChangeStatus = useCallback(
    (task: Task, newStatus: Task["status"]) => {
      return api.setStatus(task.id, newStatus).then((task) => {
        console.log({task});
        
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        notification.success({ message: "Task updated" });
        return task;
      });
    },
    [tasks, api]
  );

  return (
    <div className="App">
      <List
        header={header}
        className="demo-loadmore-list"
        loading={loading}
        itemLayout="horizontal"
        bordered
        // loadMore={loadMore}
        dataSource={tasks}

        footer={<Input onChange={e => setBaseUrl(e.target.value)} value={baseUrl}/>}
        renderItem={(task) => (
          <TaskItem
            task={task}
            onDelete={onDelete}
            onChangeAssignee={onChangeAssignee}
            onChangeStatus={onChangeStatus}
          />
        )}
      />
    </div>
  );
}

export default App;
