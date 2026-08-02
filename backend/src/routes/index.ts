import { Router, Request, Response } from 'express';

const router = Router();

// Health Check Route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend API is running cleanly!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
