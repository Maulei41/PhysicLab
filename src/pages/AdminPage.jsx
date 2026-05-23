import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

import Navbar from '../components/Navbar';
import EditRecordModal from '../components/EditRecordModal';
import { getStudentLogins, formatLoginTime, updateStudentLogin, deleteStudentLogin } from '../utils/studentTracker';
import { exportToCSV } from '../utils/csvExport';

export default function AdminPage() {
  const [logins, setLogins] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadLogins = () => {
    const studentLogins = getStudentLogins();
    setLogins([...studentLogins].reverse());
  };

  useEffect(() => {
    loadLogins();
  }, []);

  const handleExport = () => {
    // Export the current logins in descending order to match UI
    const rows = [...logins].map(r => ({ name: r.name, sid: r.sid, loginTime: r.loginTime }));
    exportToCSV(rows, `student_records_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleEdit = (index) => {
    setSelectedIndex(index);
    setSelectedRecord(logins[index]);
    setEditOpen(true);
  };

  const handleSaveEdit = (indexInReversed, name, sid) => {
    // Convert index in reversed list to actual storage index
    const actualIndex = logins.length - 1 - indexInReversed;
    const ok = updateStudentLogin(actualIndex, name, sid);
    if (ok) loadLogins();
  };

  const handleDelete = (index) => {
    setSelectedIndex(index);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    const actualIndex = logins.length - 1 - selectedIndex;
    const ok = deleteStudentLogin(actualIndex);
    if (ok) loadLogins();
    setConfirmOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar isAdmin={true} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Student Login Records
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage student login records. You can edit or delete records, or export them as CSV.
          </Typography>
        </Box>

        <Paper elevation={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Tooltip title="Export as CSV">
              <Button startIcon={<DownloadIcon />} variant="contained" onClick={handleExport}>
                Export CSV
              </Button>
            </Tooltip>
          </Box>

          {logins.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">No student logins yet</Typography>
              <Typography color="text.secondary">Student records will appear here when they log in.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Student ID (SID)</TableCell>
                    <TableCell>Login Time</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logins.map((login, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{login.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{login.sid}</TableCell>
                      <TableCell>{formatLoginTime(login.loginTime)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(index)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {logins.length > 0 && (
            <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="body2" color="text.secondary">
                Total logins recorded: <strong>{logins.length}</strong> | Unique students: <strong>{new Set(logins.map(l => l.sid)).size}</strong>
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Edit Modal */}
        {selectedRecord && (
          <EditRecordModal
            open={editOpen}
            record={selectedRecord}
            recordIndex={selectedIndex}
            onSave={handleSaveEdit}
            onClose={() => setEditOpen(false)}
          />
        )}

        {/* Delete Confirmation */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete Record</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this record? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
