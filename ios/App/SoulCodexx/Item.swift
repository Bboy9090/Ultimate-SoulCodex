//
//  Item.swift
//  SoulCodexx
//
//  Created by bj90-m1 on 4/25/26.
//  Copyright © 2026 Bobbysworld. All rights reserved.
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
