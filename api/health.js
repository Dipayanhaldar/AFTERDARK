import handler from './[...route].js';

export default function healthHandler(req, res) {
  return handler(req, res);
}
