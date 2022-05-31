import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Dropdown, List, Menu, Row, Tooltip, Typography } from "antd";
import { useCallback } from "react";
import { Task } from "./App";


const statusToTextMap = {
    todo: "To-do",
    "in-progress": "In progress",
    done: "Done",
  };

export type TaskItemProps = {
    task: Task;
    onDelete: (task: Task) => void;
    onChangeStatus: (task: Task, newStatus: Task['status']) => void;
    onChangeAssignee: (task: Task, assigneeEmail: string | undefined) => void;    
};

export const TaskItem = (props: TaskItemProps) => {
    const {task, onDelete, onChangeStatus, onChangeAssignee} = props;


  const _onDelete = useCallback(() => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Are you sure?")) {
        onDelete(task);
      }
    },
    [onDelete, task]
  );

  const changeStatus = useCallback((status: Task['status']) => {
    onChangeStatus(task, status);
  }, [onChangeStatus, task]);

  const setAssignee = useCallback(() => {
    const email = prompt(`Enter the new assignee's email (or empty to set as unassigned)`);
    onChangeAssignee(task, email || undefined);
  }, [onChangeAssignee, task])


  const statusMenu = (
    <Menu
      items={['todo', 'in-progress', 'done'].map((status: any) => ({
          key: status,
          onClick: () => changeStatus(status),
          label: `Change to "${status}"`
      }))}
    />
  );

    return (
        <List.Item
          className="task-list-item"
          // actions={[<Button>Change Status</Button>, <Button danger>Assign</Button>, <Button danger>Delete</Button>]}
        >
          <Row wrap={false}>
            <Col flex="auto">
              <Typography.Text strong>{task.title}</Typography.Text>
            </Col>
            <Divider type="vertical" />
            <Col flex="auto 0">
              <Dropdown overlay={statusMenu} arrow trigger={['click']}>
                <Typography.Text style={{cursor: 'pointer'}}>
                  Status:{" "}
                  <Typography.Text type="success">
                    {statusToTextMap[task.status]}
                  </Typography.Text>
                </Typography.Text>
              </Dropdown>
            </Col>
            <Divider type="vertical" />
            <Col flex="auto 0">
            <Tooltip title="Click to set a new assignee">
            <Typography.Text style={{cursor: 'pointer'}} onClick={setAssignee}>
                Assignee:{" "}
                <Typography.Text type="secondary">
                  {task.assigneeEmail || "Unassigned"}
                </Typography.Text>
              </Typography.Text>
              </Tooltip>
            </Col>
            <Divider type="vertical" />
            <Col flex="auto 0">
              <Button danger onClick={_onDelete}>
                <DeleteOutlined />
              </Button>{" "}
            </Col>
          </Row>
        </List.Item>
      )
}