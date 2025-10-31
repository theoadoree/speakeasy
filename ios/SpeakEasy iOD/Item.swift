//
//  Item.swift
//  SpeakEasy iOD
//
//  Created by Scott on 10/30/25.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
