import { Request, Response } from 'express';
import { AssignShipmentToRoute } from '@application/shipments/AssignShipmentToRoute';
import { GetAvailableRoutes } from '@application/shipments/GetAvailableRoutes';
import { GetAvailableTransporters } from '@application/shipments/GetAvailableTransporters';
import { GetPendingShipments } from '@application/shipments/GetPendingShipments';
import { ShipmentPostgresRepository } from '@infrastructure/db/postgres/ShipmentPostgresRepository';
import { RoutePostgresRepository } from '@infrastructure/db/postgres/RoutePostgresRepository';
import { TransporterPostgresRepository } from '@infrastructure/db/postgres/TransporterPostgresRepository';
import { ShipmentAssignmentPostgresRepository } from '@infrastructure/db/postgres/ShipmentAssignmentPostgresRepository';
import { ShipmentStatusPostgresRepository } from '@infrastructure/db/postgres/ShipmentStatusPostgresRepository';
import { UserPostgresRepository } from '@infrastructure/db/postgres/UserPostgresRepository';
import { EmailService } from '@infrastructure/notifications/EmailService';
import db from '@config/database';

/**
 * Asigna un envío a una ruta y opcionalmente a un transportista
 */
export const assignShipmentToRoute = async (req: Request, res: Response) => {
  const admin = (req as any).user;
  
  // Verificar que el usuario sea un administrador
  if (admin.role_name !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Solo los administradores pueden asignar envíos a rutas'
    });
  }

  // Inicializar repositorios y servicios
  const shipmentRepo = new ShipmentPostgresRepository();
  const routeRepo = new RoutePostgresRepository(db);
  const transporterRepo = new TransporterPostgresRepository(db);
  const assignmentRepo = new ShipmentAssignmentPostgresRepository(db);
  const statusRepo = new ShipmentStatusPostgresRepository();
  const userRepo = new UserPostgresRepository();
  const emailService = new EmailService();

  // Inicializar caso de uso
  const assignShipment = new AssignShipmentToRoute(
    shipmentRepo,
    routeRepo,
    transporterRepo,
    assignmentRepo,
    statusRepo,
    emailService,
    userRepo
  );

  try {
    const assignmentData = {
      ...req.body,
      admin_id: admin.id
    };

    const result = await assignShipment.execute(assignmentData);
    return res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Error desconocido al asignar el envío'
      });
    }
  }
};

/**
 * Obtiene todas las rutas disponibles
 */
export const getAvailableRoutes = async (req: Request, res: Response) => {
  const routeRepo = new RoutePostgresRepository(db);
  const getRoutes = new GetAvailableRoutes(routeRepo);
  
  try {
    const filters = {
      origin_id: req.query.origin_id ? Number(req.query.origin_id) : undefined,
      destination_id: req.query.destination_id ? Number(req.query.destination_id) : undefined
    };
    
    const routes = await getRoutes.execute(filters);
    return res.status(200).json({
      status: 'success',
      data: routes
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener las rutas'
      });
    }
  }
};

/**
 * Obtiene todos los transportistas disponibles con capacidad suficiente
 */
export const getAvailableTransporters = async (req: Request, res: Response) => {
  const transporterRepo = new TransporterPostgresRepository(db);
  const getTransporters = new GetAvailableTransporters(transporterRepo);
  
  try {
    const requiredCapacity = req.query.capacity ? Number(req.query.capacity) : undefined;
    const transporters = await getTransporters.execute(requiredCapacity);
    
    return res.status(200).json({
      status: 'success',
      data: transporters
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener los transportistas'
      });
    }
  }
};

/**
 * Obtiene todos los envíos pendientes de asignación
 */
export const getPendingShipments = async (req: Request, res: Response) => {
  const shipmentRepo = new ShipmentPostgresRepository();
  const assignmentRepo = new ShipmentAssignmentPostgresRepository(db);
  const getPendingShipments = new GetPendingShipments(shipmentRepo, assignmentRepo);
  
  try {
    const pendingShipments = await getPendingShipments.execute();
    
    return res.status(200).json({
      status: 'success',
      data: pendingShipments
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener los envíos pendientes'
      });
    }
  }
};

/**
 * Obtiene todas las asignaciones de envíos con filtros opcionales
 */
export const getShipmentAssignments = async (req: Request, res: Response) => {
  const assignmentRepo = new ShipmentAssignmentPostgresRepository(db);
  
  try {
    const filters: any = {};
    
    if (req.query.route_id) filters.route_id = Number(req.query.route_id);
    if (req.query.transporter_id) filters.transporter_id = Number(req.query.transporter_id);
    if (req.query.completed !== undefined) filters.completed = req.query.completed === 'true';
    if (req.query.from_date) filters.from_date = new Date(req.query.from_date as string);
    if (req.query.to_date) filters.to_date = new Date(req.query.to_date as string);
    
    const assignments = await assignmentRepo.getFiltered(filters);
    
    return res.status(200).json({
      status: 'success',
      data: assignments
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener las asignaciones'
      });
    }
  }
};
