import { useEffect, useMemo, useState } from 'react';

import Swal from 'sweetalert2';

import { addHours, addYears, differenceInSeconds, setHours, setMinutes } from 'date-fns';
import es from 'date-fns/locale/es';

import Modal from 'react-modal';
import DatePicker, { registerLocale } from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { useCalendarStore, useUiStore } from '../../hooks';

registerLocale( 'es', es );

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

export const CalendarModal = () => {

  const { activeEvent } = useCalendarStore();

  const { closeDateModal, isDateModalOpen, toggleDateModal } = useUiStore();

  const [ formSubmitted, setFormSubmitted ] = useState( false );

  const [ formValues, setFormValues ] = useState({
    title: 'Joshua',
    notes: 'Torres',
    start: new Date(),
    end: addHours( new Date(), 2 ),
  })

  const titleClass = useMemo(() => {

    if ( !formSubmitted ) return '';

    return ( formValues.title.length > 0 )
      ? ''
      : 'is-invalid'

  }, [ formValues.title, formSubmitted ])

  useEffect(() => {

    if ( activeEvent !== null ) {
      setFormValues({ ...activeEvent });
    }

  }, [ activeEvent ])


  const onInputChanged = ({ target }) => {

    setFormValues({
      ...formValues,
      [ target.name ]: target.value
    });

  }

  // const onDateChanged = ( event, changing , changing = start || end ) => {
  const onDateChanged = ( event, changing ) => {

    setFormValues({
      ...formValues,
      [ changing ]: event
    });

  }

  const onCloseModal = () => {
    closeDateModal();
  }

  const onSubmit = ( event ) => {
    event.preventDefault();
    setFormSubmitted( true );

    // Validando que las fechas esten seleccionadas correctamente
    const difference = differenceInSeconds( formValues.end, formValues.start );

    if ( isNaN( difference ) || difference <= 0 ) {
      Swal.fire('Fechas incorrectas','Revisar las fechas ingresadas','error');
      return;
    }

    // Validando que se haya ingresado al menos un caracter en el titulo
    if ( formValues.title.length <= 0 ) return;

    console.log( formValues );

  }

  return (
    <Modal
      isOpen={ isDateModalOpen }
      onRequestClose={ onCloseModal }
      style={ customStyles }
      className="modal"
      overlayClassName="modal-fondo"
      closeTimeoutMS={200}
    >

      <h1> Nuevo evento </h1>
      <hr />
      <form className="container" onSubmit={ onSubmit }>

        <div className="form-group mb-2">
          <label className="d-block">Fecha y hora inicio:</label>
          <DatePicker
            selected={ formValues.start }
            onChange={ ( event ) => onDateChanged( event, 'start' ) }
            className="form-control w-100"
            dateFormat="Pp"
            showTimeSelect
            locale="es"
            timeCaption='Hora'
          />
        </div>

        <div className="form-group mb-2">
          <label className="d-block">Fecha y hora fin:</label>
          <DatePicker
            minDate={ formValues.start }
            selected={ formValues.end }
            onChange={ ( event ) => onDateChanged( event, 'end' ) }
            className="form-control"
            dateFormat="Pp"
            showTimeSelect
            locale="es"
            timeCaption='Hora'
            minTime={ setHours( setMinutes( new Date(), formValues.start.getMinutes() ), formValues.start.getHours() ) }
            maxTime={ setHours( setMinutes( addYears( new Date(), 1000 ) , 30 ), 23 ) }
          />
        </div>

        <hr />
        <div className="form-group mb-2">
          <label>Titulo y notas</label>
          <input
            type="text"
            className={`form-control ${ titleClass }`}
            placeholder="Título del evento"
            name="title"
            autoComplete="off"
            value={ formValues.title }
            onChange={ onInputChanged }
          />
          <small id="emailHelp" className="form-text text-muted">Una descripción corta</small>
        </div>

        <div className="form-group mb-2">
          <textarea
            type="text"
            className="form-control"
            placeholder="Notas"
            rows="5"
            name="notes"
            value={ formValues.notes }
            onChange={ onInputChanged }
          ></textarea>
          <small id="emailHelp" className="form-text text-muted">Información adicional</small>
        </div>

        <button
          type="submit"
          className="btn btn-outline-primary btn-block"
        >
          <i className="far fa-save"></i>
          <span> Guardar</span>
        </button>

      </form>

    </Modal>
  )
}