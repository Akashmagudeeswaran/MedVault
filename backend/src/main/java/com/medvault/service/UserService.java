package com.medvault.service;

import com.medvault.entity.User;
import com.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.medvault.exception.ResourceNotFoundException("User not found for ID: " + id));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }
}
