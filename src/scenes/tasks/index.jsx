import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Updated import
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
} from "@mui/material";

const TaskListPage = () => {
  const { staffId } = useParams(); // Extract staffId from route params
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (staffId) {
      fetch(`http://51.20.144.224:3000/task/listTasks/${staffId}`)
        .then((response) => response.json())
        .then((data) => {
          setTasks(data.tasks);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
          setLoading(false);
        });
    }
  }, [staffId]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box m="20px">
      <Typography variant="h4">Liste des tâches</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Product ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Historique</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.taskId}>
              <TableCell>{task.fullNameClient}</TableCell>
              <TableCell>{task.productId}</TableCell>
              <TableCell>{task.taskStatus}</TableCell>
              <TableCell>
                {task.historyTasks.map((history, index) => (
                  <div key={index}>
                    <span>{history.HistoryTasktype}</span> -{" "}
                    <span>{history.date}</span>
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default TaskListPage;
