self.addEventListener('message', function(e) {
    self.postMessage(e.data + ' yourself!')
    self.close();
})