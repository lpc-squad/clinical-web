import { useRef, useState } from "react";
import shortId from "shortid";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Paper
} from "@material-ui/core";

import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@material-ui/core";

import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "@material-ui/core";

import db from "../../src/api";

import AvatarPlaceholder from "../../components/AvatarPlaceholder";

function NewRegister(props) {
  let timeout = null; // Debounce
  const inputContainer = useRef(""); // Debounce

  const [modal, setModal] = useState(false);
  const [patient, setPatient] = useState(null);
  const [indications, setIndications] = useState("");
  const [observations, setObservations] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  /**
   * Debounce search
   */
  function handleChange() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // TODO: No será demasiado?
      const { value } = inputContainer.current.children[1].children[0];
      searchPatient(value);
    }, 400);
  }

  function handleSelect(patient) {
    setPatient(patient);
    toggleModal();
  }

  function toggleModal() {
    setModal(m => !m);
  }

  function searchPatient(text) {
    if (!text) {
      setSearchResult([]);
      return;
    }
    let txt = text.toLowerCase();
    const result = db
      .get("patients")
      .filter(
        o =>
          o.name.toLowerCase().includes(txt) ||
          o.surname.toLowerCase().includes(txt) ||
          o.documentId.toString().includes(txt)
      )
      .value();

    setSearchResult(result);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const collection = db.get("records");
    console.log("ESTADO ACTUAL", db.getState());

    if (!patient || !indications || !observations) {
      console.info("NO FUE CREADO");
      return;
    }

    const result = collection
      .push({
        _id: shortId.generate(),
        _doctorId: 1, // FIXME hardCoded
        _patientId: patient._id,
        indications,
        observations,
        date: new Date()
      })
      .write();

    console.log("FUE CREADO!", result);
  }

  return (
    <Paper style={{ padding: 48 }}>
      <form onSubmit={handleSubmit}>
        <Grid container direction="column" spacing={4}>
          <Grid item>
            <Grid container direction="column" spacing={4}>
              <Grid item>
                <Typography variant="h2">Crear registro</Typography>
              </Grid>
              <Grid item>
                <Grid container spacing={4} alignItems="center">
                  <Grid item sm={6} xs={12}>
                    <Grid container direction="column" spacing={4}>
                      <Grid item>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          id="observations"
                          variant="outlined"
                          label="🩺Motivo de consulta, observaciones"
                          onChange={e => setObservations(e.target.value)}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          id="indications"
                          variant="outlined"
                          label="💊Indicaciones para el paciente"
                          placeholder="Medicamentos, tratamientos..."
                          onChange={e => setIndications(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <Patient data={patient} toggleModal={toggleModal} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container style={{ justifyContent: "center" }}>
              <Grid item>
                <Button variant="contained" color="primary" type="submit">
                  Crear registro
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <SearchPatient
        open={modal}
        onClose={toggleModal}
        input={inputContainer}
        handleChange={handleChange}
        searchResult={searchResult}
        selectPatient={handleSelect}
      />
    </Paper>
  );
}

function Patient({ data, toggleModal }) {
  if (data) {
    console.log(data);
    return (
      <Card>
        <CardContent>
          <Grid
            container
            alignItems="center"
            justifycontent="center"
            spacing={4}
          >
            <Grid item>
              <AvatarPlaceholder gender={data.gender} />
            </Grid>
            <Grid item>
              <Typography>Nombre: {data.name}</Typography>
              <Typography>Documento: {data.documentId}</Typography>
              <Link href="/patients/[id]" as={`/patients/${data._id}`}>
                <Button variant="outlined" component="a">
                  Ver ficha completa
                </Button>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card>
        <CardContent style={{ textAlign: "center" }}>
          <Button onClick={toggleModal}>Buscar paciente</Button>
        </CardContent>
      </Card>
    );
  }
}

function SearchPatient({
  open,
  input,
  onClose,
  handleChange,
  selectPatient,
  searchResult = []
}) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Buscar paciente</DialogTitle>
      <DialogContent style={{ minWidth: 600 }}>
        <TextField
          autoFocus
          fullWidth
          ref={input}
          label="Palabras clave"
          onChange={handleChange}
          placeholder="Nombre, apellido, DNI"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Documento de identidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchResult.length > 0 &&
              searchResult.map((i, k) => (
                <TableRow key={k}>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.surname}</TableCell>
                  <TableCell>{i.documentId}</TableCell>
                  <TableCell>
                    <Button onClick={() => selectPatient(i)}>
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {searchResult.length === 0 && (
          <DialogContentText align="center">
            Escribí algún filtro
          </DialogContentText>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NewRegister;
